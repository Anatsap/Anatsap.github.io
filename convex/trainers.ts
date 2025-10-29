import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const submitTrainerSignup = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    trainer: v.string(),
    datetime: v.string(),
    exerciseCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("trainerSignups", {
      name: args.name,
      email: args.email,
      trainer: args.trainer,
      datetime: args.datetime,
      exerciseCode: args.exerciseCode,
      status: "pending",
    });
  },
});

export const getSignupsByTrainer = query({
  args: { trainer: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trainerSignups")
      .withIndex("by_trainer", (q) => q.eq("trainer", args.trainer))
      .order("desc")
      .collect();
  },
});

export const getSignupsByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trainerSignups")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .order("desc")
      .collect();
  },
});

export const updateSignupStatus = mutation({
  args: {
    signupId: v.id("trainerSignups"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.signupId, {
      status: args.status,
    });
  },
});
