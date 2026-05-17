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
      question: msg,
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body, expected);
});

test("command lower transforms message into lowercase", async () => {
  const app = createServer();

  const msg = "MAKE THIS LOWERCASE";

  const expected = msg.toLowerCase();

  const response = await app.inject({
    method: "POST",
    url: "/chat",
    payload: {
      question: msg,
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body, expected);
});

test("command unknown transforms message into unknown response", async () => {
  const app = createServer();

  const msg = "MAKE THIS UNKNOWN";

  const expected = 'unknown command. try including "upper" or "lower" in your message';

  const response = await app.inject({
    method: "POST",
    url: "/chat",
    payload: {
      question: msg,
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body, expected);
});

