import { env, type PretrainedOptions } from "@huggingface/transformers";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { homedir } from "node:os";
import { join } from "node:path";
import { CONFIG } from "./config.ts";
import { DocumentProcessor } from "./documentProcessor.ts";
import { displayResults } from "./util.ts";

// Windows MAX_PATH (260 chars) workaround: keep cache outside the deep project tree
env.cacheDir = join(homedir(), ".cache", "huggingface", "transformers");

let _neo4jVectorStore = null;

async function clearAll(vectorStore: Neo4jVectorStore, nodeLabel: string) {
  console.log(`clearing all nodes with label ${nodeLabel} from Neo4j...`);
  await vectorStore.query(`MATCH (n:${nodeLabel}) DETACH DELETE n`);
  console.log("all nodes cleared.");
}

try {
  console.log("starting embeddings-neo4j");

  const documentProcessor = new DocumentProcessor(
    CONFIG.pdf.path,
    CONFIG.textSplitter,
  );

  const documents = await documentProcessor.loadAndSplit();

  const embeddings = new HuggingFaceTransformersEmbeddings({
    model: CONFIG.embedding.modelName,
    pretrainedOptions: CONFIG.embedding.pretrainedOptions as PretrainedOptions,
  });

  _neo4jVectorStore = await Neo4jVectorStore.fromExistingGraph(
    embeddings,
    CONFIG.neo4j,
  );

  clearAll(_neo4jVectorStore, CONFIG.neo4j.nodeLabel);

  for (const [index, document] of documents.entries()) {
    console.log(`adding document ${index + 1}/${documents.length} to Neo4j...`);
    await _neo4jVectorStore.addDocuments([document]);
  }
  console.log("all documents added to Neo4j.");

  // ==================== STEP 2: RUN SIMILARITY SEARCH ====================
  console.log("executando buscas por similaridade...\n");
  const questions = [
    // "O que são tensores e como são representados em JavaScript?",
    // "Como converter objetos JavaScript em tensores?",
    // "O que é normalização de dados e por que é necessária?",
    // "Como funciona uma rede neural no TensorFlow.js?",
    "O que significa treinar uma rede neural?",
    // "o que é hot enconding e quando usar?",
  ];

  for (const question of questions) {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`📌 PERGUNTA: ${question}`);
    console.log("=".repeat(80));

    const results = await _neo4jVectorStore.similaritySearch(
      question,
      CONFIG.similarity.topK,
    );
    displayResults(results);
  }

  // Cleanup
  console.log(`\n${"=".repeat(80)}`);
  console.log("processamento concluído com sucesso!\n");
} catch (error) {
  console.error("error in embeddings-neo4j:", error);
} finally {
  _neo4jVectorStore?.close();
}
