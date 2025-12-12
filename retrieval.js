import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { retriever } from "./utils/retrieval.js";

const openAIApiKey = process.env.openAIApiKey;

const retrieval = async (req, res) => {
  const llm = new ChatOpenAI({
    apiKey: openAIApiKey,
  });

  const standaloneQuestionTemplate =
    "Given a question, convert it to a standalone question. question: {question} standalone question:";

  const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
    standaloneQuestionTemplate
  );

  const chain = standaloneQuestionPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())
    .pipe(retriever);

  const results = await chain.invoke({
    question:
      "What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful.",
  });

  const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the context provided. Try to find the answer in the context. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
context: {context}
question: {question}
answer:`;

  const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

  const combineDocs = (docs) => docs.map((doc) => doc.pageContent).join("\n\n");

  const answer = await answerPrompt.pipe(llm).invoke({
    context: combineDocs(results),
    question:
      "What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful.",
  });

  res.json(answer);
};

export default retrieval;
