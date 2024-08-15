import { templates } from "@/templates";
import { PromptTemplate } from "@langchain/core/prompts";
import Bottleneck from "bottleneck";
import { LLMChain } from "langchain/chains";
import { ChatGroq } from "@langchain/groq";

const llm = new ChatGroq({
  model: "mixtral-8x7b-32768",
  temperature: 0,
  maxTokens: 600,
  maxRetries: 1,
  apiKey: process.env.GROQ_API_KEY,
  verbose: true,

});

const { summarizerTemplate, summarizerDocumentTemplate } = templates;

const limiter = new Bottleneck({
  minTime: 2000,
});

const chunkSubstr = (str, size) => {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
};

const summarize = async ({ document, inquiry, onSummaryDone }) => {
  try {
    const promptTemplate = new PromptTemplate({
      template: inquiry ? summarizerTemplate : summarizerDocumentTemplate,
      inputVariables: inquiry ? ["document", "inquiry"] : ["document"],
    });

    const chain = new LLMChain({
      prompt: promptTemplate,
      llm: llm,
    });
    const result = await chain.call({
      document,
      inquiry,
    });

    console.log("Primary LLM result:", result);
    onSummaryDone && onSummaryDone(result.text);
    return result.text;
  } catch (error) {
    console.log(error);
  }
};

const rateLimitedSummarize = limiter.wrap(summarize);

const summarizeLongDocument = async ({ document, inquiry, onSummaryDone }) => {
  const templateLength = inquiry
    ? summarizerTemplate.length
    : summarizerDocumentTemplate.length;
  console.log(document.length)
  try {
    if (document.length + templateLength > 150000) {
      console.log(document.length, "DOC_LENGTH");
      const chunks = chunkSubstr(document, 3000);
      console.log(chunks, "CHUNKS");
      let summarizedChunks = [];

      for (const chunk of chunks) {
        const summary = await rateLimitedSummarize({
          document: chunk,
          inquiry,
          onSummaryDone,
        });
        summarizedChunks.push(summary);
      }
      const result = summarizedChunks.join("\n");

      if (result.length + templateLength > 150000) {
        return await summarizeLongDocument({
          document: result,
          inquiry,
          onSummaryDone,
        });
      } else {
        console.log("Summarization done");
        return result;
      }
    } else {
      return document;
    }
  } catch (error) {
    throw new Error(error);
  }
};

export { summarizeLongDocument };
