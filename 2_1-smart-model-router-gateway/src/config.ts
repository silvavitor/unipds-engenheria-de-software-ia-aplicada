console.assert(
  process.env.OPENROUTER_API_KEY,
  "OPENROUTER_API_KEY is not set in .env file",
);

export type ModelConfig = {
  apiKey: string;
  httpReferer: string;
  xTitle: string;
  port: number;
  models: string[];
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  provider: {
    sort: {
      by: string;
      partition: string;
    };
  };
};

export const config: ModelConfig = {
  apiKey: process.env.OPENROUTER_API_KEY!,
  httpReferer: "http://pos-ia.com",
  xTitle: "Smart Model Router Gateway",
  port: 3000,
  models: [
    "arcee-ai/trinity-large-thinking:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
  ],
  temperature: 0.2,
  maxTokens: 512,
  systemPrompt: "helpful assistant",
  provider: {
    sort: {
      // by: "price",
      // by: "latency",
      by: "throughput",
      partition: "none",
    },
  },
};
