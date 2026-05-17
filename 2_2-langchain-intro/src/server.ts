import Fastify from "fastify";
import { HumanMessage } from "langchain";
import { buildGraph } from "./graph/nodes/graph.ts";

const graph = buildGraph();

export const createServer = () => {
  const app = Fastify({
    logger: false,
  });

  app.post(
    "/chat",
    {
      schema: {
        body: {
          type: "object",
          required: ["question"],
          properties: {
            question: {
              type: "string",
              minLength: 5,
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { question } = request.body as { question: string };

        const response = await graph.invoke({
          messages: [new HumanMessage(question)],
        });

        reply.send(response.output);
      } catch (error) {
        console.error("Error handling /chat request:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    },
  );

  return app;
};
