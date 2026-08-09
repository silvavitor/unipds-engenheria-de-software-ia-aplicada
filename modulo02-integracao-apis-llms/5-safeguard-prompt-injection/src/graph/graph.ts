import { END, START, StateGraph } from '@langchain/langgraph';
import { OpenRouterService } from '../services/openrouterService.ts';
import { blockedNode } from './nodes/blockedNode.ts';
import { createChatNode } from './nodes/chatNode.ts';
import { routeAfterGuardrails } from './nodes/edgeConditions.ts';
import { createGuardrailsCheckNode } from './nodes/guardrailsCheckNode.ts';
import { type GraphState, SafeguardStateAnnotation } from './state.ts';

export function buildChatGraph() {
  const service = new OpenRouterService();
  const workflow = new StateGraph({
    stateSchema: SafeguardStateAnnotation,
  })
    .addNode('guardrails_check', createGuardrailsCheckNode(service))
    .addNode('chat', createChatNode(service))
    .addNode('blocked', blockedNode)

    // Set entry point
    .addEdge(START, 'guardrails_check')

    // Define conditional edge after guardrails check
    .addConditionalEdges(
      'guardrails_check',
      (state: GraphState) => routeAfterGuardrails(state),
      {
        chat: 'chat',
        blocked: 'blocked',
      }
    )

    // Both chat and blocked nodes end the flow
    .addEdge('chat', END)
    .addEdge('blocked', END);

  return workflow.compile();
}
