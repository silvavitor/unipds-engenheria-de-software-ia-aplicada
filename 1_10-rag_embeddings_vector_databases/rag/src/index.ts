import { env, type PretrainedOptions } from "@huggingface/transformers";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { ChatOpenAI } from "@langchain/openai";
import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { AI } from "./ai.ts";
import { CONFIG } from "./config.ts";
import { DocumentProcessor } from "./documentProcessor.ts";

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

  const nlp = new ChatOpenAI({
    temperature: CONFIG.openRouter.temperature,
    maxRetries: CONFIG.openRouter.maxRetries,
    model: CONFIG.openRouter.nlpModel,
    openAIApiKey: CONFIG.openRouter.apiKey,
    configuration: {
      baseURL: CONFIG.openRouter.url,
      defaultHeaders: CONFIG.openRouter.defaultHeaders,
    },
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
    "O que são tensores e como são representados em JavaScript?",
    // "Como converter objetos JavaScript em tensores?",
    // "O que é normalização de dados e por que é necessária?",
    // "Como funciona uma rede neural no TensorFlow.js?",
    "O que significa treinar uma rede neural?",
    // "o que é hot enconding e quando usar?",
  ];

  const ai = new AI({
    debugLog: console.log,
    vectorStore: _neo4jVectorStore,
    nlpModel: nlp,
    promptConfig: CONFIG.promptConfig,
    templateText: CONFIG.templateText,
    topK: CONFIG.similarity.topK,
  });

  for (const index in questions) {
    const question = questions[index]!;
    console.log(`\n${"=".repeat(80)}`);
    console.log(`📌 PERGUNTA: ${question}`);
    console.log("=".repeat(80));

    const result = await ai.answerQuestion(question);

    if (result.error) {
      console.log(`\n❌ Erro: ${result.error}\n`);
      continue;
    }

    console.log(`\n✅ Resposta:\n${result.answer}\n`);

    await mkdir(CONFIG.output.answersFolder, { recursive: true });
    const filename = `${CONFIG.output.answersFolder}/${CONFIG.output.filename}_${Number(Number(index) + 1)}_${Date.now()}.md`;
    await writeFile(
      filename,
      `# Pergunta:\n${question}\n\n# Resposta:\n${result.answer}\n`,
    );
  }

  // Cleanup
  console.log(`\n${"=".repeat(80)}`);
  console.log("processamento concluído com sucesso!\n");
} catch (error) {
  console.error("error in embeddings-neo4j:", error);
} finally {
  _neo4jVectorStore?.close();
}
