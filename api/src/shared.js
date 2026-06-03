"use strict";

/*
 * shared.js — helpers used by the Functions API.
 */

// Azure Table Storage forbids these characters in PartitionKey / RowKey:
//   / \ # ?  plus control chars (U+0000–U+001F, U+007F–U+009F).
// Replace anything unsafe so arbitrary student names / class codes are safe keys.
function sanitizeKey(value) {
  return String(value == null ? "" : value)
    .replace(/[\\/#?\u0000-\u001f\u007f-\u009f]/g, "_")
    .slice(0, 200)
    .trim() || "_";
}

// Build a stable partition key for a student from class code + name.
function studentPartition(student) {
  const code = sanitizeKey((student && student.classCode) || "nocode");
  const name = sanitizeKey((student && student.name) || "anon");
  return code + "::" + name;
}

// Pull the table connection string from the usual env vars. Falls back to the
// Functions runtime storage account so it works out-of-the-box on Static Web Apps.
function tableConnectionString() {
  return process.env.SCORES_TABLE_CONNECTION ||
    process.env.AzureWebJobsStorage ||
    "";
}

const SCORES_TABLE_NAME = process.env.SCORES_TABLE_NAME || "scores";

module.exports = {
  sanitizeKey,
  studentPartition,
  tableConnectionString,
  SCORES_TABLE_NAME
};
