import { ChatOpenAI } from '@langchain/openai';
import { config } from '../config.ts';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import type { z } from 'zod/v3';
import { createAgent, providerStrategy } from 'langchain';

export type LLMResponse = {
  model: string;
  content: string;
};

/**
 * OpenRouter answers upstream provider failures with HTTP 200 and a body of
 * `{ error: { message, code } }` — no `choices`. The OpenAI SDK then blows up
 * inside `parseChatCompletion` with `Cannot read properties of undefined
 * (reading 'map')`, which hides the real cause. Translate those bodies into a
 * real HTTP error so the message survives and the SDK can retry.
 */
const openRouterFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input as never, init as never);

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return response;

  const text = await response.text();
  let body: { error?: { message?: string; code?: number }; choices?: unknown[] };
  try {
    body = JSON.parse(text);
  } catch {
    return new Response(text, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  if (body?.error && !body?.choices) {
    const code = body.error.code;
    const status = typeof code === 'number' && code >= 400 && code <= 599 ? code : 502;
    return new Response(
      JSON.stringify({
        error: {
          message: `OpenRouter upstream error: ${body.error.message ?? JSON.stringify(body.error)}`,
          type: 'upstream_error',
          code: status,
        },
      }),
      { status, headers: { 'content-type': 'application/json' } }
    );
  }

  return new Response(text, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};

export class OpenRouterService {
  private llmClient: ChatOpenAI;

  constructor() {
    this.llmClient = new ChatOpenAI({
      apiKey: config.apiKey,
      modelName: config.models[0],
      temperature: config.temperature,
      timeout: config.requestTimeoutMs,
      maxRetries: config.maxRetries,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        fetch: openRouterFetch,
        defaultHeaders: {
          'HTTP-Referer': config.httpReferer,
          'X-Title': config.xTitle,
        },
      },

      // Pass provider routing and models array to OpenRouter
      modelKwargs: {
        models: config.models,
        provider: config.provider,
      },
    });
  }

  async generateStructured<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: z.ZodSchema<T>
  ) {
    const startedAt = Date.now();
    try {
      const agent = createAgent({
        model: this.llmClient,
        tools: [],
        responseFormat: providerStrategy(schema),
      });

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt),
      ];

      const data = await agent.invoke({ messages });
      console.log(`🧠 LLM responded in ${Date.now() - startedAt}ms`);
      return {
        success: true,
        data: data.structuredResponse as T,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`🧠 LLM failed after ${Date.now() - startedAt}ms: ${message}`);
      return {
        success: false,
        error: message,
      };
    }
  }
}
