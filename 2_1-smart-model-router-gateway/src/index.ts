import { config } from "./config.ts";
import { OpenRouterService } from "./openrouterService.ts";
import { createServer } from "./server.ts";

const openRouterService = new OpenRouterService(config);

const app = createServer(openRouterService);

await app.listen({ port: config.port, host: "0.0.0.0" });

app
  .inject({
    method: "POST",
    url: "/chat",
    payload: {
      question: "What is the capital of France?",
    },
  })
  .then((response) => {
    console.log(response.statusCode);
    console.log(response.body);
  });
