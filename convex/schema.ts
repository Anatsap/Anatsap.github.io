import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  exercises: defineTable({
    code: v.string(),
    machine: v.string(),
    videoUrl: v.string(),
    instructions: v.string(),
  }).index("by_code", ["code"]),
  
  trainerSignups: defineTable({
    name: v.string(),
    email: v.string(),
    trainer: v.string(),
    datetime: v.string(),
    exerciseCode: v.optional(v.string()),
    status: v.string(), // "pending", "confirmed", "cancelled"
  }).index("by_email", ["email"])
    .index("by_trainer", ["trainer"])
    .index("by_status", ["status"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
