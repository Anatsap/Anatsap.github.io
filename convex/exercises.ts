import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getExerciseByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const exercise = await ctx.db
      .query("exercises")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .unique();
    return exercise;
  },
});

export const getAllExercises = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("exercises").collect();
  },
});

export const addExercise = mutation({
  args: {
    code: v.string(),
    machine: v.string(),
    videoUrl: v.string(),
    instructions: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("exercises", {
      code: args.code.toUpperCase(),
      machine: args.machine,
      videoUrl: args.videoUrl,
      instructions: args.instructions,
    });
  },
});

// Initialize with sample data
export const initializeSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("exercises").first();
    if (existing) return; // Already initialized

    const sampleExercises = [
      {
        code: "LP-02",
        machine: "Leg Press (LP-02)",
        videoUrl: "https://www.youtube.com/embed/8BcPHWGQO44",
        instructions: "Place your feet shoulder-width on the platform, keep your back pressed to the seat, lower slowly and push evenly with both legs. Breath out on the push. Avoid locking the knees.",
      },
      {
        code: "BP-01",
        machine: "Bench Press (BP-01)",
        videoUrl: "https://www.youtube.com/embed/vthMCtgVtFw",
        instructions: "Lie flat on the bench, plant your feet, grip slightly wider than shoulder-width, lower the bar to mid-chest and press up explosively while exhaling. Keep scapulae retracted.",
      },
      {
        code: "PL-01",
        machine: "Treadmill (PL-01)",
        videoUrl: "https://www.youtube.com/embed/5X3r1s5x46s",
        instructions: "Use a controlled warm-up, maintain upright posture, short quick arm swings and avoid leaning forward. Start slow then increase speed gradually.",
      },
    ];

    for (const exercise of sampleExercises) {
      await ctx.db.insert("exercises", exercise);
    }
  },
});
