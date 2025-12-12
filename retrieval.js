import express from "express";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

const retrieval = async (req, res) => {
  const sbApiKey = process.env.SUPABASE_API_KEY;
  const sbUrl = process.env.SUPABASE_URL_LC_CHATBOT;
  const openAIApiKey = process.env.openAIApiKey;

  const client = createClient(sbUrl, sbApiKey);

  // Vector Store (new API)
  const { SupabaseVectorStore } = await import(
    "@langchain/community/vectorstores/supabase"
  );

  const embeddings = new OpenAIEmbeddings({ openAIApiKey });
  // Create embeddings

  const vectorStore = await SupabaseVectorStore.fromDocuments(embeddings, {
    client,
    tableName: "documents",
    queryName: "match_documents",
  });

  const retrieval = vectorStore.asRetriever();

  const llm = new ChatOpenAI({
    apiKey: openAIApiKey,
  });

  const standaloneQuestionTemplate =
    "Given a question, convert it to a standalone question. question: {question} standalone question:";

  const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
    standaloneQuestionTemplate
  );

  const standaloneQuestionChain = standaloneQuestionPrompt
    .pipe(llm)
    .pipe(retrieval);

  const results = await standaloneQuestionChain.invoke({
    question:
      "What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful.",
  });

  res.json(results);
};

export default retrieval;
