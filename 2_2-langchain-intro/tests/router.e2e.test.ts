import assert from "node:assert/strict";
import test from "node:test";

import { createServer } from "../src/server.ts";

test("command upper transforms message into UPPERCASE", async () => {
  const app = createServer();

  const msg = "make ThIs UppErCase";

  const expected = msg.toUpperCase();

  const response = await app.inject({
    method: "POST",
    url: "/chat",
    payload: {
      question: "What is the capital of France?",
    },
  });

  assert.equal(response.body, expected);
});
