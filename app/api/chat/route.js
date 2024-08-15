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
import pusher from "@/utils/pusher";

const getMatchesFromEmbeddings = async (embeddings, pinecone, topK) => {
  if (!process.env.PINECONE_INDEX_NAME) {
    throw new Error("PINECONE_INDEX_NAME is not set");
  }

  const index = pinecone.Index("animebot");
  try {
    const queryResult = await index.query({
      vector: embeddings,
      topK,
      includeMetadata: true,
    });
    return (
      queryResult.matches?.map((match) => ({
        ...match,
        metadata: match.metadata,
      })) || []
    );
  } catch (e) {
    console.error("Error querying embeddings: ", e);
    throw new Error(`Error querying embeddings: ${e}`);
  }
};

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
  console.log("Pinecone client initialized.");
};

export async function POST(req) {
  if (!pinecone) {
    await initPineconeClient();
  }

  const data = await req.json();
  const auth = await getAuth();
  const userId = auth?.user?.id;
  const sessionId = data?.sessionId;
  const lastUserPrompt = data?.messages[data?.messages.length - 1]?.content;

  let conversationHistory = "";
  if (userId) {
    const conversationLog = new ConversationLog(userId);
    conversationHistory = await conversationLog.getConversation({ limit: 10 });

    await conversationLog.addEntry({
      entry: lastUserPrompt,
      speaker: "USER",
    });
  }

  const pusherChannel = userId ? `user-${userId}` : sessionId;

  if (pusherChannel) {
    pusher.trigger(pusherChannel, "status", {
      status: "I'm gathering the information for you... Hang tight!",
    });
  }

  const inquiryChain = new LLMChain({
    llm,
    prompt: new PromptTemplate({
      template: templates.inquiryTemplate,
      inputVariables: ["userPrompt", "conversationHistory"],
    }),
  });
  const inquiryChainResult = await inquiryChain.call({
    userPrompt: lastUserPrompt,
    conversationHistory: conversationHistory || "",
  });
  const inquiry = inquiryChainResult.text;

  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const embeddings = await model.embedContent(inquiry);

  const matches = await getMatchesFromEmbeddings(
    embeddings?.embedding?.values,
    pinecone,
    6
  );

  const docs = [...new Set(matches?.map((match) => match?.metadata?.chunk))];

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

  if (pusherChannel) {
    pusher.trigger(pusherChannel, "status", {
      status: "Just a moment, finalizing the response...",
    });
  }

  const allDocs = docs.join("\n");
  const summary =
    allDocs.length > 4000
      ? await summarizeLongDocument({ document: allDocs, inquiry })
      : allDocs;

  const resultChain = await chain.call({
    summaries: summary,
    question: lastUserPrompt,
    conversationHistory: conversationHistory || "",
  });

  if (pusherChannel) {
    pusher.trigger(pusherChannel, "status", {
      removePrev: true,
    });
  }

  const result = resultChain.text;
  const CHUNK_SIZE = 500;
  const chunks = result.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "g")) || [];
 
  for (let i = 0; i < chunks.length; i++) {
    if (pusherChannel) {
      pusher.trigger(pusherChannel, "content", {
        chunk: chunks[i],
      });
    }
  }

  return new NextResponse("Done");
}
