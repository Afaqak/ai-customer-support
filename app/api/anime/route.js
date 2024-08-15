import { Pinecone } from "@pinecone-database/pinecone";
import Crawler from "@/utils/crawler";
import { Document } from "langchain/document";
import Bottleneck from "bottleneck";
import { v4 as uuid } from "uuid";
import { TokenTextSplitter } from "langchain/text_splitter";
import { summarizeLongDocument } from "@/utils/summarizer";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const limiter = new Bottleneck({
  minTime: 20,
});

let pinecone = null;

const genAI = new GoogleGenerativeAI(process.env.VERTEX_API_KEY);

const initPineconeClient = async () => {
  try {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    console.log("Pinecone initialized");
  } catch (error) {
    console.error("Error initializing Pinecone:", error);
  }
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

  const urls = [
    "https://www.reddit.com/r/Naruto/comments/10r1y18/what_are_some_real_life_lessons_youve_learned/",
  ];
  const crawlLimit = 20;
  const pineconeIndexName = "animebot";
  const shouldSummarize = true;

  if (!pinecone) {
    await initPineconeClient();
  }

  try {
    const indexes = pinecone && (await pinecone.listIndexes())?.indexes;
    let foundIndex = indexes?.find(
      (index) => index?.name === pineconeIndexName
    );

    if (!foundIndex) {
      console.log("Creating Pinecone index...");
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
      console.log("Index created:", created);
    }

    const crawler = new Crawler(urls, crawlLimit, 200);
    const pages = await crawler.start();

    const documents = await Promise.all(
      pages.map(async (row) => {
        const splitter = new TokenTextSplitter({
          encodingName: "gpt2",
          chunkSize: 400,
          chunkOverlap: 20,
        });

        const pageContent = shouldSummarize
          ? await summarizeLongDocument({ document: row.text })
          : row.text;

        const docs = splitter.splitDocuments([
          new Document({
            pageContent,
            metadata: {
              text: pageContent,
            },
          }),
        ]);

        console.log();

        return docs;
      })
    );

    console.log(documents, "Documents processed");

    const index = pinecone && pinecone.Index(pineconeIndexName);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

    let counter = 0;

    const getEmbedding = async (doc) => {
      try {
        const embedding = await model.embedContent(doc.pageContent);
        process.stdout.write(
          `${Math.floor((counter / documents.flat().length) * 100)}%\r`
        );
        counter += 1;
        return {
          id: uuid(),
          values: embedding.embedding.values,
          metadata: {
            chunk: doc.pageContent,
          },
        };
      } catch (error) {
        console.error("Error generating embedding:", error);
      }
    };

    const rateLimitedGetEmbedding = limiter.wrap(getEmbedding);

    let vectors = [];

    try {
      vectors = await Promise.all(
        documents.flat().map((doc) => rateLimitedGetEmbedding(doc))
      );
      const chunks = sliceIntoChunks(vectors, 400)?.flat();

      console.log(chunks, "Vectors");

      await index.upsert(chunks);

      return NextResponse.json({ message: "Done" });
    } catch (e) {
      console.log("Error during upsert:", e);
      return NextResponse.json({ message: `Error ${JSON.stringify(e)}` });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ message: `Error: ${error.message}` });
  }
}
