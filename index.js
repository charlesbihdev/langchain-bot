import express from "express";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs/promises";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
// import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import retrieval from "./retrieval.js";

const app = express();

app.get("/", async (req, res) => {
  const text = await fs.readFile("scrimba-info.txt", "utf-8");

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 480,
    separators: ["\n\n", "\n", " ", ""],
    chunkOverlap: 50,
  });

  const output = await splitter.createDocuments([text]);
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

  const store = await SupabaseVectorStore.fromDocuments(output, embeddings, {
    client,
    tableName: "documents",
    queryName: "match_documents",
  });

  await store.addDocuments(output);

  res.json({ status: "ingested", chunks: output.length });
});

app.get("/r", retrieval);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
