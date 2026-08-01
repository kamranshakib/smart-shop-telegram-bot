const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const connectDB = require("../config/db");

test("connectDB returns failure instead of exiting when Mongo connection fails", async () => {
  const originalConnect = mongoose.connect;
  mongoose.connect = async () => {
    throw new Error("simulated connection failure");
  };

  try {
    const result = await connectDB();
    assert.equal(result.success, false);
    assert.ok(result.error instanceof Error);
  } finally {
    mongoose.connect = originalConnect;
  }
});
