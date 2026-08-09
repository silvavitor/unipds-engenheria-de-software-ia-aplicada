import { PromptTemplate } from '@langchain/core/prompts';
import { AIMessage } from 'langchain';
import { prompts } from '../../config.ts';
import type { GraphState } from '../state.ts';

export async function blockedNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  const guardRailCheck = state.guardrailCheck!;
  const analysis = guardRailCheck.analysis
    ? `**analysis**: ${guardRailCheck.analysis}`
    : '';

  const permissions = state.user.permissions?.join(', ') ?? 'none';

  const template = PromptTemplate.fromTemplate(prompts.blocked);

  const blockedMessage = await template.format({
    USER_NAME: state.user.displayName,
    USER_ROLE: state.user.role,
    USER_PERMISSIONS: permissions,
    REASON: guardRailCheck.reason ?? 'unknown',
    ANALYSIS: analysis,
  });

  return {
    messages: [new AIMessage(blockedMessage)],
  };
}
