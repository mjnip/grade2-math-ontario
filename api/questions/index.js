"use strict";

// v3-model entry that reuses the existing handler logic. Azure Static Web Apps
// managed Functions index the classic (function.json) model reliably, so this
// thin adapter bridges the v3 (context, req) signature to the shared handler.
const { handler } = require("../src/functions/questions");

module.exports = async function (context, req) {
  const shim = {
    error: function () {
      const log = context.log && context.log.error ? context.log.error.bind(context.log) : console.error;
      return log.apply(null, arguments);
    }
  };
  const adapted = {
    method: req.method,
    url: (req.headers && req.headers["x-ms-original-url"]) || "https://localhost/api/questions",
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
