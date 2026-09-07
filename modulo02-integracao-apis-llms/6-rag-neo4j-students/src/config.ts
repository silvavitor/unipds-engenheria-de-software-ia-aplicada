export const config = {
  apiKey: process.env.OPENROUTER_API_KEY!,
  httpReferer: '',
  xTitle: 'IA Devs - Sales Analytics Reporter',
  models: ['nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free'],
  provider: {
    // OpenRouter expects a plain string here, not an object.
    sort: 'throughput', // Route to the fastest provider for the model
  },
  temperature: 0.7,
  // Free reasoning models take 9-30s per call and often fail; fail fast
  // instead of leaving the graph pending with no output.
  requestTimeoutMs: 60_000,
  maxRetries: 2,
  neo4j: {
    uri: 'neo4j://localhost:7687',
    username: 'neo4j',
    password: 'password',
  },
  maxCorrectionAttempts: 3,
  maxSubQuestions: 3,
};

export default config;
