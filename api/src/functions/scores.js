"use strict";

const { TableClient, odata } = require("@azure/data-tables");
const {
  sanitizeKey, studentPartition, tableConnectionString, SCORES_TABLE_NAME
} = require("../shared");

/*
 * scores — per-student score history.
 *   GET  /api/scores?classCode=&name=   -> { attempts: [...] }
 *   POST /api/scores  { student, attempt } -> { saved: true, attempt }
 *
 * Each attempt is stored as one Table entity:
 *   PartitionKey = `${classCode}::${name}` (sanitized)
 *   RowKey       = attempt id
 * so a student's full history is a single partition query.
 */

let cachedClient = null;
function getClient() {
  if (cachedClient) return cachedClient;
  const conn = tableConnectionString();
  if (!conn) return null;
  cachedClient = TableClient.fromConnectionString(conn, SCORES_TABLE_NAME, {
    allowInsecureConnection: /UseDevelopmentStorage=true|127\.0\.0\.1|localhost/i.test(conn)
  });
  return cachedClient;
}

async function ensureTable(client) {
  try { await client.createTable(); } catch (e) { /* already exists -> ignore */ }
}

function jsonResponse(status, body) {
  return {
    status,
    headers: { "Content-Type": "application/json" },
    jsonBody: body
  };
}

async function handler(request, context) {
  const client = getClient();
  if (!client) {
    // No storage configured: behave gracefully so the client keeps local state.
    if (request.method === "GET") return jsonResponse(200, { attempts: [] });
    return jsonResponse(503, { error: "Score storage is not configured." });
  }

  try {
    await ensureTable(client);

    if (request.method === "GET") {
      const url = new URL(request.url);
      const partition = studentPartition({
        classCode: url.searchParams.get("classCode"),
        name: url.searchParams.get("name")
      });
      const attempts = [];
      const entities = client.listEntities({
        queryOptions: { filter: odata`PartitionKey eq ${partition}` }
      });
      for await (const e of entities) {
        attempts.push({
          id: e.rowKey,
          unitId: e.unitId,
          score: e.score,
          total: e.total,
          stars: e.stars,
          at: e.at
        });
      }
      attempts.sort((a, b) => new Date(a.at) - new Date(b.at));
      return jsonResponse(200, { attempts });
    }

    if (request.method === "POST") {
      let body;
      try { body = await request.json(); }
      catch (e) { return jsonResponse(400, { error: "Invalid JSON body." }); }

      const student = body && body.student;
      const attempt = body && body.attempt;
      if (!student || !student.name || !attempt || !attempt.unitId) {
        return jsonResponse(400, { error: "Missing student or attempt fields." });
      }

      const partition = studentPartition(student);
      const rowKey = sanitizeKey(attempt.id || ("a-" + Date.now()));
      const entity = {
        partitionKey: partition,
        rowKey,
        unitId: String(attempt.unitId).slice(0, 60),
        score: Number(attempt.score) || 0,
        total: Number(attempt.total) || 0,
        stars: Number(attempt.stars) || 0,
        at: attempt.at || new Date().toISOString()
      };
      await client.upsertEntity(entity, "Replace");
      return jsonResponse(200, { saved: true, attempt: Object.assign({ id: rowKey }, attempt) });
    }

    return jsonResponse(405, { error: "Method not allowed." });
  } catch (err) {
    // A storage outage / policy restriction must never crash the endpoint:
    // degrade gracefully so the client falls back to local score history.
    context.error("scores function failed", err);
    if (request.method === "GET") return jsonResponse(200, { attempts: [] });
    return jsonResponse(503, { error: "Score storage is temporarily unavailable." });
  }
}

module.exports = { handler };
