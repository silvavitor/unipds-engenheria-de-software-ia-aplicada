import { createServer } from "./server.ts";

const app = createServer();

await app.listen({ port: 3000, host: "0.0.0.0" });

// app
//   .inject({
//     method: "POST",
//     url: "/chat",
//     payload: {
//       question: "What is the capital of France?",
//     },
//   })
//   .then((response) => {
//     console.log(response.statusCode);
//     console.log(response.body);
//   });
