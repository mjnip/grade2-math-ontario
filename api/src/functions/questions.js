"use strict";

const { app } = require("@azure/functions");

/*
 * questions — dynamically generate fresh practice questions with Azure OpenAI.
 *   POST /api/questions  { unitId, count } -> { questions: [...] }
 *
 * Returns questions in the exact shape the quiz engine expects:
 *   { type:'mc',  prompt, choices:[...], answer:<index>, explain }
 *   { type:'num', prompt, answer:<number>, explain }
 *
 * Required app settings (Azure OpenAI):
 *   AZURE_OPENAI_ENDPOINT     e.g. https://my-aoai.openai.azure.com
 *   AZURE_OPENAI_API_KEY
 *   AZURE_OPENAI_DEPLOYMENT   the chat model deployment name
 *   AZURE_OPENAI_API_VERSION  optional (default 2024-10-21)
 * When these are not set the function returns 501 with an empty list and the
 * client falls back to its built-in offline generator.
 */

// Curriculum topics drive the prompt so generated content stays on-strand.
const UNIT_TOPICS = {
  number: "whole numbers to 200, place value (hundreds/tens/ones), skip counting by 2s/5s/10s/25s, comparing and ordering numbers, addition and subtraction to 100, and simple fractions (one half, one fourth)",
  algebra: "repeating, growing, and shrinking patterns; equality and the equal sign; and finding a missing number in a simple equation",
  data: "tally charts, pictographs and bar graphs, reading data, and the likelihood of simple events (impossible, unlikely, likely, certain)",
  spatial: "2D shapes and their sides/vertices, 3D solids, location and movement, and measurement of length in centimetres",
  money: "Canadian coins (nickels, dimes, quarters, loonies), counting amounts in cents, and making simple spending choices"
};

function jsonResponse(status, body) {
  return { status, headers: { "Content-Type": "application/json" }, jsonBody: body };
}

function isValidQuestion(q) {
  if (!q || typeof q.prompt !== "string" || !q.prompt.trim()) return false;
  if (q.type === "mc") {
    return Array.isArray(q.choices) && q.choices.length >= 2 && q.choices.length <= 5 &&
      Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length;
  }
  if (q.type === "num") {
    return q.answer !== undefined && q.answer !== null && String(q.answer).trim() !== "";
  }
  return false;
}

// Coerce/sanitize a model-produced question into the canonical shape.
function normalize(q) {
  const out = { type: q.type === "mc" ? "mc" : "num", prompt: String(q.prompt).trim() };
  if (out.type === "mc") {
    out.choices = q.choices.map(function (c) { return String(c); });
    out.answer = q.answer;
  } else {
    out.answer = typeof q.answer === "number" ? q.answer : String(q.answer).trim();
  }
  out.explain = q.explain ? String(q.explain).trim() : "";
  return out;
}

function buildMessages(unitId, count) {
  const topic = UNIT_TOPICS[unitId];
  const system = [
    "You are a friendly Grade 2 (age 7) mathematics teacher creating practice questions",
    "aligned to the Ontario 2020 Grade 2 Mathematics curriculum.",
    "All content must be safe, encouraging, and appropriate for young children.",
    "Keep numbers within Grade 2 range (generally 0–200; addition/subtraction within 100).",
    "Return ONLY valid JSON, no markdown, matching this schema:",
    '{ "questions": [ { "type": "mc", "prompt": string, "choices": [string,...], "answer": integer-index, "explain": string }',
    '  | { "type": "num", "prompt": string, "answer": number, "explain": string } ] }',
    'For "mc", "answer" is the 0-based index of the correct choice and there must be 2–4 choices.',
    'For "num", "answer" is the single correct number. Always include a short, kid-friendly "explain".'
  ].join(" ");
  const user = "Create " + count + " new and varied " + unitId +
    " questions about: " + topic + ". Make them different from each other.";
  return [
    { role: "system", content: system },
    { role: "user", content: user }
  ];
}

async function callAzureOpenAI(messages, context) {
  const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";
  if (!endpoint || !apiKey || !deployment) return null; // not configured

  const url = endpoint + "/openai/deployments/" + encodeURIComponent(deployment) +
    "/chat/completions?api-version=" + encodeURIComponent(apiVersion);

  const controller = new AbortController();
  const timeout = setTimeout(function () { controller.abort(); }, 25000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      signal: controller.signal,
      body: JSON.stringify({
        messages,
        temperature: 0.8,
        max_tokens: 1200,
        response_format: { type: "json_object" }
      })
    });
    if (!res.ok) {
      context.error("Azure OpenAI returned " + res.status);
      return null;
    }
    const data = await res.json();
    const content = data && data.choices && data.choices[0] &&
      data.choices[0].message && data.choices[0].message.content;
    return content || null;
  } catch (e) {
    context.error("Azure OpenAI call failed", e);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function handler(request, context) {
  let body;
  try { body = await request.json(); }
  catch (e) { return jsonResponse(400, { error: "Invalid JSON body." }); }

  const unitId = body && body.unitId;
  if (!unitId || !UNIT_TOPICS[unitId]) {
    return jsonResponse(400, { error: "Unknown or missing unitId." });
  }
  const count = Math.max(1, Math.min(10, Number(body && body.count) || 5));

  const content = await callAzureOpenAI(buildMessages(unitId, count), context);
  if (content === null) {
    // Not configured or upstream failure -> signal client to use local fallback.
    return jsonResponse(501, { error: "Question generation is unavailable.", questions: [] });
  }

  let parsed;
  try { parsed = JSON.parse(content); }
  catch (e) {
    context.error("Could not parse model output as JSON");
    return jsonResponse(502, { error: "Generator returned malformed data.", questions: [] });
  }

  const raw = Array.isArray(parsed) ? parsed : (parsed.questions || []);
  const questions = raw.map(normalize).filter(isValidQuestion).slice(0, count);
  if (!questions.length) {
    return jsonResponse(502, { error: "Generator returned no valid questions.", questions: [] });
  }
  return jsonResponse(200, { questions });
}

app.http("questions", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "questions",
  handler
});

module.exports = { handler, isValidQuestion, normalize, UNIT_TOPICS };
