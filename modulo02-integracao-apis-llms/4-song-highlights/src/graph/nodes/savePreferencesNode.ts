import type { Runtime } from "@langchain/langgraph";
import type { PreferencesService } from "../../services/preferencesService.ts";
import type { GraphState } from "../graph.ts";

export function createSavePreferencesNode(
  preferencesService: PreferencesService
) {
  return async (
    state: GraphState,
    runtime?: Runtime
  ): Promise<Partial<GraphState>> => {
    if (!state.extractedPreferences) {
      return {};
    }

    const userId = String(
      runtime?.context?.userId || state.userId || "unknown"
    );

    await preferencesService.mergePreferences(
      userId,
      state.extractedPreferences
    );

    return {
      ...state,
      extractedPreferences: undefined,
    };
  };
}
