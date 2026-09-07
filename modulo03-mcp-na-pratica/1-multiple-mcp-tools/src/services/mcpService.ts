import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { getCSVTOJSONTool } from '../tools/csvToJSONTool';
import { getFSTool } from '../tools/fsTool';
import { getMongoDBTool } from '../tools/mongodbTool';

export const getMCPTools = async () => {
  const client = new MultiServerMCPClient({
    mcpServers: {
      ...getMongoDBTool(),
      ...getFSTool(),
    },
    onMessage: (log, source) => {
      console.log(`[${source.server}] ${log.data}`);
    },
  });

  const mcpTools = await client.getTools();

  return [...mcpTools, getCSVTOJSONTool()];
};
