import { END, MessagesZodMeta, START, StateGraph } from "@langchain/langgraph";
import { withLangGraph } from "@langchain/langgraph/zod";
import { BaseMessage } from "langchain";
import { z } from "zod/v3";
import { chatResponseNode } from "./nodes/chatResponseNode.ts";
import { fallbackNode } from "./nodes/fallbackNode.ts";
import { identifyIntent } from "./nodes/identifyIntentNode.ts";
import { lowerCaseNode } from "./nodes/lowerCaseNode.ts";
import { upperCaseNode } from "./nodes/upperCaseNode.ts";

const graphState = z.object({
  messages: withLangGraph(z.custom<BaseMessage[]>(), MessagesZodMeta),
  output: z.string(),
  command: z.enum(["uppercase", "lowercase", "unknown"]),
});

export type GraphState = z.infer<typeof graphState>;

export function buildGraph() {
  const workflow = new StateGraph({
    stateSchema: graphState,
  })

    .addNode("identifyIntent", identifyIntent)
    .addNode('chatResponseNode', chatResponseNode)
    .addNode('upperCaseNode', upperCaseNode)
    .addNode('lowerCaseNode', lowerCaseNode)
    .addNode('fallbackNode', fallbackNode)
    
    .addEdge(START, "identifyIntent")
    .addConditionalEdges(
      "identifyIntent",
      (state: GraphState) => {
        switch (state.command) {
          case "uppercase":
            return "upperCaseNode";
          case "lowercase":
            return "lowerCaseNode";
          default:
            return "fallbackNode";
        }
      },
      {
        upperCaseNode: "upperCaseNode",
        lowerCaseNode: "lowerCaseNode",
        fallbackNode: "fallbackNode",
      }
    )
    .addEdge("upperCaseNode", "chatResponseNode")
    .addEdge("lowerCaseNode", "chatResponseNode")
    .addEdge("fallbackNode", "chatResponseNode")
    .addEdge("chatResponseNode", END);

  return workflow.compile();
}
