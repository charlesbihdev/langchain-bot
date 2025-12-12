import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import "dotenv/config";

const openAIApiKey = process.env.openAIApiKey;

// console.log(openAIApiKey);

const llm = new ChatOpenAI({
  apiKey: openAIApiKey,
});

const standaloneQuestionTemplate =
  "Given a question, convert it to a standalone question. question: {question} standalone question:";

const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
  standaloneQuestionTemplate
);

const standaloneQuestionChain = standaloneQuestionPrompt.pipe(llm);

const results = await standaloneQuestionChain.invoke({
  question:
    "What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful.",
});

console.log(results);
// console.log(standaloneQuestionChain);
