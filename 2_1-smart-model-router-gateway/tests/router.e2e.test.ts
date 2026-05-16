import assert from "node:assert/strict";
import test from "node:test";
import { config } from "../src/config.ts";
import {
  type LLMResponse,
  OpenRouterService,
} from "../src/openrouterService.ts";
import { createServer } from "../src/server.ts";

console.assert(
  process.env.OPENROUTER_API_KEY,
  "OPENROUTER_API_KEY is not set in .env file",
);

test("routes to cheaper model by default", async () => {
  const customConfig = {
    ...config,
    provider: {
      ...config.provider,
      sort: {
        ...config.provider.sort,
        by: "price",
      },
    },
  };

  const routerService = new OpenRouterService(customConfig);

  const app = createServer(routerService);

  const response = await app.inject({
    method: "POST",
    url: "/chat",
    payload: {
      question: "What is the capital of France?",
    },
  });

  assert.equal(response.statusCode, 200);
  const { response: body } = response.json() as { response: LLMResponse };

  assert.equal(body.model, "arcee-ai/trinity-large-thinking:free");
});

test("routes to best throughput model by default", async () => {
  const customConfig = {
    ...config,
    provider: {
      ...config.provider,
      sort: {
        ...config.provider.sort,
        by: "throughput",
      },
    },
  };

  const routerService = new OpenRouterService(customConfig);

  const app = createServer(routerService);

  const response = await app.inject({
    method: "POST",
    url: "/chat",
    payload: {
      question: "What is the capital of France?",
    },
  });

  assert.equal(response.statusCode, 200);
  const { response: body } = response.json() as { response: LLMResponse };

  assert.equal(body.model, "nvidia/nemotron-3-nano-30b-a3b:free");
});

test("routes to best latency model by default", async () => {
  const customConfig = {
    ...config,
    provider: {
      ...config.provider,
      sort: {
        ...config.provider.sort,
        by: "latency",
      },
    },
  };

  const routerService = new OpenRouterService(customConfig);

  const app = createServer(routerService);

  const response = await app.inject({
    method: "POST",
    url: "/chat",
    payload: {
      question: "What is the capital of France?",
    },
  });

  assert.equal(response.statusCode, 200);
  const { response: body } = response.json() as { response: LLMResponse };

  assert.equal(body.model, "nvidia/nemotron-3-nano-30b-a3b:free");
});
