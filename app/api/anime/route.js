import { Pinecone } from "@pinecone-database/pinecone";
import Crawler from "@/utils/crawler";
import { Document } from "langchain/document";
import Bottleneck from "bottleneck";
import { uuid } from "uuidv4";
import { TokenTextSplitter } from "langchain/text_splitter";
import { summarizeLongDocument } from "@/utils/summarizer";
import { OllamaEmbeddings } from "@langchain/ollama";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const limiter = new Bottleneck({
  minTime: 20,
});

let pinecone = null;

const genAI = new GoogleGenerativeAI(process.env.VERTEX_API_KEY);

const initPineconeClient = async () => {
  pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  console.log("init pinecone");
};

const truncateStringByBytes = (str, bytes) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

const sliceIntoChunks = (arr, chunkSize) => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, (i + 1) * chunkSize)
  );
};

export async function POST(req, res) {
  if (!process.env.PINECONE_INDEX_NAME) {
    return NextResponse.json({ message: "PINECONE_INDEX_NAME not set" });
  }

  const urls = ["https://naruto.fandom.com/wiki/Naruto_Uzumaki#Part_I"];
  const crawlLimit = 20;
  const pineconeIndexName = "animebot";
  const shouldSummarize = true;

  if (!pinecone) {
    await initPineconeClient();
  }

  const indexes = pinecone && (await pinecone.listIndexes())?.indexes;
  console.log(indexes, "INDEXES");
  let foundIndex = indexes?.find((index) => index?.name === pineconeIndexName);
  console.log(foundIndex, "FOUND");

  if (!foundIndex) {
    const created = await pinecone.createIndex({
      name: pineconeIndexName,
      dimension: 768,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });
    console.log(created, "CREATED");
  }

  const crawler = new Crawler(urls, crawlLimit, 200);
  const pages = await crawler.start();
  console.log(pages.length, "PAGES_LENGTH");

  const documents = await Promise.all(
    pages.map(async (row) => {
      const splitter = new TokenTextSplitter({
        encodingName: "gpt2",
        chunkSize: 500,
        chunkOverlap: 20,
      });

      const pageContent = shouldSummarize
        ? await summarizeLongDocument({ document: row.text })
        : row.text;

      const docs = splitter.splitDocuments([
        new Document({
          pageContent,
          metadata: {
            url: row.url,
            text: pageContent,
          },
        }),
      ]);
      return docs;
    })
  );

  console.log(documents.length, "DOCS");

  const index = pinecone && pinecone.Index("animebot");
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

  let counter = 0;

  const getEmbedding = async (doc) => {
    const embedding = await model.embedContent(doc.pageContent);
    console.log(doc.pageContent);
    console.log("got embedding", embedding.embedding.values, "VALUES");
    process.stdout.write(
      `${Math.floor((counter / documents.flat().length) * 100)}%\r`
    );
    counter = counter + 1;
    return {
      id: uuid(),
      values: embedding.embedding.values,
      metadata: {
        chunk: doc.pageContent,
     
      },
    };
  };

  const rateLimitedGetEmbedding = limiter.wrap(getEmbedding);
  process.stdout.write("100%\r");
  console.log("done embedding");

  let vectors = [];

  try {
    console.log(documents,'DOCS')
    vectors = await Promise.all(
      documents.flat().map((doc) => rateLimitedGetEmbedding(doc))
    );
    
    console.log(vectors,'VECTORS')

    await index.upsert(vectors);

    return NextResponse.json({ message: "Done" });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: `Error ${JSON.stringify(e)}` });
  }
}
