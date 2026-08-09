import { PromptTemplate } from '@langchain/core/prompts';
import { prompts } from '../../config.ts';
import type { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../state.ts';

export const createGuardrailsCheckNode = (
  openRouterService: OpenRouterService
) => {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    try {
      const userPrompt = state.messages.at(-1)?.text ?? '';
      const template = PromptTemplate.fromTemplate(prompts.system);

      const systemPrompt = await template.format({
        USER_ROLE: state.user.role,
        USER_NAME: state.user.displayName,
      });

      const msg = systemPrompt.concat('\n\n').concat(userPrompt);

      const result = await openRouterService.checkGuardRails(
        msg,
        state.guardrailsEnabled
      );

      return {
        guardrailCheck: result,
      };
    } catch (error) {
      console.error('Guardrails check failed:', error);

      return {
        guardrailCheck: {
          reason: 'Guardrails check failed',
          safe: false,
        },
      };
    }
  };
};
