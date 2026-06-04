"use strict";

// v3-model entry that reuses the existing handler logic (see questions/index.js).
const { handler } = require("../src/functions/scores");

module.exports = async function (context, req) {
  const shim = {
    error: function () {
      const log = context.log && context.log.error ? context.log.error.bind(context.log) : console.error;
      return log.apply(null, arguments);
    }
  };
  let origUrl = req.headers && req.headers["x-ms-original-url"];
  if (!origUrl) {
    const qs = new URLSearchParams(req.query || {}).toString();
    origUrl = "https://localhost/api/scores" + (qs ? "?" + qs : "");
  }
  const adapted = {
    method: req.method,
    url: origUrl,
    headers: req.headers || {},
    json: async function () { return req.body; }
  };
  const result = await handler(adapted, shim);
  context.res = {
    status: result.status,
    headers: result.headers || { "Content-Type": "application/json" },
    body: result.jsonBody !== undefined ? result.jsonBody : result.body
  };
};
