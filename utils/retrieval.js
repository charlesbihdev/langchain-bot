import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";

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

const vectorStore = await new SupabaseVectorStore(embeddings, {
  client,
  tableName: "documents",
  queryName: "match_documents",
});

const retriever = vectorStore.asRetriever();

export { retriever };
