import { ConversationLog } from "@/db";
import { getAuth } from "@/utils/get-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGroq } from "@langchain/groq";
import { Pinecone } from "@pinecone-database/pinecone";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { templates } from "@/templates";
import { NextResponse } from "next/server";
import { summarizeLongDocument } from "@/utils/summarizer";

const getMatchesFromEmbeddings = async (embeddings, pinecone, topK) => {
  if (!process.env.PINECONE_INDEX_NAME) {
    throw new Error("PINECONE_INDEX_NAME is not set");
  }

  const index = pinecone.Index("animebot");
  try {
    const queryResult = await index.query({
      vector: embeddings,
      topK: 2,
      includeMetadata: true,
    });
    return (
      queryResult.matches?.map((match) => ({
        ...match,
        metadata: match.metadata,
      })) || []
    );
  } catch (e) {
    console.log("Error querying embeddings: ", e);
    throw new Error(`Error querying embeddings: ${e}`);
  }
};

export { getMatchesFromEmbeddings };

let pinecone = null;

const genAI = new GoogleGenerativeAI(process.env.VERTEX_API_KEY);

const llm = new ChatGroq({
  model: "mixtral-8x7b-32768",
  temperature: 0,
  maxTokens: 300,
  maxRetries: 1,
  apiKey: process.env.GROQ_API_KEY,
  verbose: true,
});

const initPineconeClient = async () => {
  pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  console.log("init pinecone");
};

export async function POST(req) {
  if (!pinecone) {
    await initPineconeClient();
  }

  const data = await req.json();
  const auth = await getAuth();
  let summarizedCount = 0;
  const conversationLog = new ConversationLog(auth?.user?.id);
  const conversationHistory = await conversationLog.getConversation({
    limit: 10,
  });

  await conversationLog.addEntry({
    entry: data[data?.length - 1]?.content,
    speaker: "USER",
  });

  const inquiryChain = new LLMChain({
    llm,
    prompt: new PromptTemplate({
      template: templates.inquiryTemplate,
      inputVariables: ["userPrompt", "conversationHistory"],
    }),
  });
  const inquiryChainResult = await inquiryChain.call({
    userPrompt: data[data?.length - 1]?.content,
    conversationHistory,
  });
  const inquiry = inquiryChainResult.text;

  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const embeddings = await model.embedContent(inquiry);

  const matches = await getMatchesFromEmbeddings(
    embeddings?.embedding?.values,
    pinecone,
    2
  );

  const docs = [...new Set(matches?.map((match) => match?.metadata?.text))];

  const chat = new ChatGroq({
    model: "mixtral-8x7b-32768",
    temperature: 0,
    maxTokens: 200,
    maxRetries: 1,
    apiKey: process.env.GROQ_API_KEY,
    verbose: true,
  });

  const promptTemplate = new PromptTemplate({
    template: templates.qaTemplate,
    inputVariables: ["summaries", "question", "conversationHistory"],
  });

  const chain = new LLMChain({
    prompt: promptTemplate,
    llm: chat,
  });
  const allDocs = docs.join("\n");
  console.log(docs,docs[0].length,allDocs.length)

  const summary =
    allDocs.length > 4000
      ? await summarizeLongDocument({ document: allDocs, inquiry })
      : allDocs;

  const resultChain = await chain.call({
    summaries: summary,
    question: data[data?.length - 1]?.content,
    conversationHistory,
  });

  const result = resultChain.text;

  // Split the final result into chunks for streaming
  const CHUNK_SIZE = 500; // Set an appropriate chunk size
  const chunks = result.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "g"));

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      chunks.forEach((chunk) => {
        const encodedChunk = encoder.encode(chunk);
        controller.enqueue(encodedChunk);
      });
      controller.close();
    },
  });

  return new NextResponse(stream);
}
