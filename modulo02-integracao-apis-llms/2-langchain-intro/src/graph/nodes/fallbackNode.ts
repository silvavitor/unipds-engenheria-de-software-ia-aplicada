import { AIMessage } from "langchain";
import { type GraphState } from "../graph.ts";

export function fallbackNode(state: GraphState): GraphState { 
  const message = 'unknown command. try including "upper" or "lower" in your message';
  const responseText = new AIMessage(message).content.toString();

  return {
    ...state,
    output: responseText
  };
}