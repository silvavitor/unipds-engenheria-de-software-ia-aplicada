import { HumanMessage, RemoveMessage } from '@langchain/core/messages';
import type { Runtime } from '@langchain/langgraph';
import {
  type ConversationSummary,
  SummarySchema,
  getSummarizationSystemPrompt,
  getSummarizationUserPrompt,
} from '../../prompts/v1/summarization.ts';
import type { OpenRouterService } from '../../services/openrouterService.ts';
import type { PreferencesService } from '../../services/preferencesService.ts';
import type { GraphState } from '../graph.ts';

export function createSummarizationNode(
  llmClient: OpenRouterService,
  preferencesService: PreferencesService
) {
  return async (
    state: GraphState,
    runtime: Runtime
  ): Promise<Partial<GraphState>> => {
    const conversationHistory = state.messages.map((msg) => ({
      role: HumanMessage.isInstance(msg) ? 'User' : 'AI',
      content: msg.text,
    }));

    const previousSummary = state.conversationSummary as
      | ConversationSummary
      | undefined;

    const systemPrompt = getSummarizationSystemPrompt();
    const userPrompt = getSummarizationUserPrompt(
      conversationHistory,
      previousSummary
    );

    const result = await llmClient.generateStructured(
      systemPrompt,
      userPrompt,
      SummarySchema
    );

    if (result.error || !result.data) {
      console.error('Erro ao gerar resumo estruturado:', result.error);
      return {
        needsSummarization: false,
      };
    }

    const userId = String(
      runtime?.context?.userId || state.userId || 'unknown'
    );
    console.log(`🚀 vitor - createSummarizationNode - userId:`, userId);
    await preferencesService.storeSummary(userId, result.data);

    const remainingMessages = state.messages
      .slice(0, -2)
      .map((msg) => new RemoveMessage({ id: msg.id as string }));

    return {
      messages: remainingMessages,
      conversationSummary: result.data,
      needsSummarization: false,
    };
  };
}
