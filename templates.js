const templates = {
  qaTemplate: `Answer the question based on the context below. You should follow ALL the following rules when generating an answer:
- There will be a CONVERSATION LOG, CONTEXT, and a QUESTION.
- The final answer must always be styled using markdown.
- Your main goal is to provide accurate and concise information about the anime based on the CONTEXT you are given.
- Provide relevant details such as plot summary, character descriptions, episode guides, etc., based on the CONTEXT.
- Always include relevant links to official sources or streaming platforms found in the CONTEXT.
- Use bullet points, lists, paragraphs, and text styling to present the answer in markdown.
- The CONTEXT will include data about anime titles, summaries, characters, episodes, and other related info.
- Summarize the CONTEXT to make it easier to read, but don't omit any crucial information.
- ALWAYS prefer the result with the highest "score" value.
- The answer should only be based on the CONTEXT. Do not use any external sources.

CONVERSATION LOG: {conversationHistory}

CONTEXT: {summaries}

QUESTION: {question}


Final Answer: `,
  summarizerTemplate: `Shorten the text in the CONTENT, focusing on the main aspects of the anime. You should follow the following rules when generating the summary:
- Preserve any code examples (like episode numbers or character stats) unchanged.
- Summarize the CONTENT to highlight key plot points, character arcs, or other relevant details.
- The summary should be under 4000 characters.
- The summary should be 2000 characters long, if possible.

INQUIRY: {inquiry}
CONTENT: {document}

Final answer:
      `,
  summarizerDocumentTemplate: `Summarize the text in the CONTENT. You should follow the following rules when generating the summary:
- Preserve any relevant information like episode numbers, character stats, or release dates unchanged.
- Summarize to include key plot points, character details, and other relevant information.
- The summary should be under 4000 characters.
- The summary should be at least 1500 characters long, if possible.

CONTENT: {document}

Final answer:

      `,
  inquiryTemplate: `Given the following user prompt and conversation log, formulate a specific and actionable question that provides the user with relevant information about an anime.
      You should follow the following guidelines:
      - Prioritize the user prompt over the conversation log.
      - Generate a question that retrieves specific details about an anime's plot, characters, episodes, themes, or its broader cultural impact.
      - If the user prompt relates to the impact of the anime on the world, ensure the final answer is correct and addresses the broader implications or influence of the anime.
      - The question should be concise, targeted, and insightful.
      
      USER PROMPT: {userPrompt}
      
      CONVERSATION LOG: {conversationHistory}
      
      Final answer:
`,
  summerierTemplate: `Summarize the following text. You should follow the following rules when generating and answer:`,
};

export { templates };
