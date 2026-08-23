import mongoose from "mongoose";

import "../config/env.js";
import connectDB from "../config/db.js";
import BlogPost from "../models/blogPost.model.js";
import User from "../models/user.model.js";

const starters = [
  {
    slug: "pause-before-the-next-step",
    category: "Focus",
    title: "The pause before the next step",
    excerpt: "A two-minute reset for the moments when every option feels equally urgent and your attention needs somewhere gentle to land.",
    tags: ["focus", "decision-making", "reset"],
    featured: true,
    coverImage: "/journal/pause-before-the-next-step.jpeg",
    coverAlt: "A person wearing glasses pausing thoughtfully with one hand resting beneath their chin.",
    metaTitle: "The pause before the next step | Curevo Journal",
    metaDescription: "Try a gentle two-minute pause to sort urgency from importance and choose one manageable next step.",
    canonicalUrl: "",
    viewCount: 184,
    publishedAt: new Date("2026-08-22T08:30:00.000Z"),
    blocks: [
      { blockId: "pause-opening", type: "paragraph", content: "When several tasks are asking for attention at once, moving faster can make the noise louder. A short pause is not wasted time. It is a way to create enough distance to see what the moment actually needs.", items: [], tone: "sage" },
      { blockId: "pause-heading", type: "heading-2", content: "Make the moment smaller", items: [], tone: "sage" },
      { blockId: "pause-body", type: "paragraph", content: "You do not need to solve the whole day. Set a two-minute timer, place both feet somewhere steady, and name the next decision in one sentence. Keep it concrete: what should I open, send, put away, or postpone?", items: [], tone: "sage" },
      { blockId: "pause-steps", type: "numbered-list", content: "", items: ["Notice what is competing for your attention.", "Choose the item with the clearest useful next action.", "Shrink that action until it can begin in under five minutes.", "Write the other items down so your mind does not have to hold them."], tone: "sage" },
      { blockId: "pause-quote", type: "quote", content: "Clarity often arrives after we stop demanding an answer from every thought at once.", items: [], tone: "sage" },
      { blockId: "pause-heading-two", type: "heading-2", content: "A pause can end with permission", items: [], tone: "sage" },
      { blockId: "pause-close", type: "paragraph", content: "If the smallest useful action still feels too large, make rest, water, food, movement, or asking someone for help the next step. The point is not perfect productivity. It is a kinder return to choice.", items: [], tone: "sage" },
      { blockId: "pause-boundary", type: "callout", content: "This reflection is general wellbeing guidance, not medical advice. If distress feels intense, persistent, or unsafe, contact a qualified professional or local emergency support.", items: [], tone: "rose" },
    ],
  },
  {
    slug: "design-a-calmer-digital-workspace",
    category: "Environment",
    title: "Design a calmer digital workspace",
    excerpt: "Small interface and browser choices can reduce visual competition before you ask yourself for more discipline.",
    tags: ["digital-space", "attention", "environment"],
    featured: false,
    coverImage: "/journal/calm-digital-workspace.png",
    coverAlt: "A desktop browser displaying a warm, dark landing page for a collaborative software community.",
    metaTitle: "Design a calmer digital workspace | Curevo Journal",
    metaDescription: "Reduce digital friction with a practical workspace reset built around fewer cues, clearer boundaries, and an easier starting point.",
    canonicalUrl: "",
    viewCount: 139,
    publishedAt: new Date("2026-08-21T08:30:00.000Z"),
    blocks: [
      { blockId: "workspace-opening", type: "paragraph", content: "A screen can quietly become a room full of unfinished conversations: open tabs, badges, bookmarks, downloads, and messages. Before treating distraction as a character flaw, try changing the room.", items: [], tone: "sage" },
      { blockId: "workspace-heading", type: "heading-2", content: "Build one visible starting point", items: [], tone: "sage" },
      { blockId: "workspace-body", type: "paragraph", content: "Choose one browser window or desktop for the work in front of you. Keep the reference you need, the place where you are making something, and one communication channel. Everything else can wait in a saved list or another workspace.", items: [], tone: "sage" },
      { blockId: "workspace-list", type: "bulleted-list", content: "", items: ["Pin only tools you use most days.", "Turn off badges that do not signal something truly time-sensitive.", "Name windows by project instead of leaving them as a pile of tabs.", "End the day by leaving one clear starting note for tomorrow."], tone: "sage" },
      { blockId: "workspace-callout", type: "callout", content: "Try changing just one cue today. A workspace that is too carefully optimized can become another project to maintain.", items: [], tone: "amber" },
      { blockId: "workspace-heading-two", type: "heading-2", content: "Let the space hold the reminder", items: [], tone: "sage" },
      { blockId: "workspace-close", type: "paragraph", content: "A calm setup cannot remove every interruption, but it can make returning less expensive. The best environment is not the most minimal one; it is the one that makes the next useful action easy to recognize.", items: [], tone: "sage" },
    ],
  },
  {
    slug: "momentum-without-burning-out",
    category: "Energy",
    title: "Momentum without burning yourself out",
    excerpt: "How to use a high-energy stretch without turning one productive afternoon into an impossible new baseline.",
    tags: ["energy", "pacing", "sustainable-progress"],
    featured: false,
    coverImage: "/journal/momentum-without-burnout.png",
    coverAlt: "An animated character surrounded by sweeping rings of bright orange and yellow fire.",
    metaTitle: "Momentum without burning out | Curevo Journal",
    metaDescription: "Use productive bursts sustainably by protecting stopping points, recovery time, and a realistic baseline for tomorrow.",
    canonicalUrl: "",
    viewCount: 116,
    publishedAt: new Date("2026-08-19T08:30:00.000Z"),
    blocks: [
      { blockId: "momentum-opening", type: "paragraph", content: "Some days arrive with unusual momentum. Ideas connect, tasks move, and stopping feels less appealing than following the energy as far as it will go. The opportunity is real, and so is the cost of treating a surge as your new minimum.", items: [], tone: "sage" },
      { blockId: "momentum-heading", type: "heading-2", content: "Decide what enough looks like early", items: [], tone: "sage" },
      { blockId: "momentum-body", type: "paragraph", content: "Before the pace carries you away, choose a finish line. It might be one completed draft, three focused rounds, or a specific clock time. A stopping point lets you enjoy momentum without asking it to make every decision.", items: [], tone: "sage" },
      { blockId: "momentum-list", type: "numbered-list", content: "", items: ["Capture new ideas without immediately starting each one.", "Pause between focus rounds to check water, food, posture, and time.", "Leave a short restart note before you stop.", "Make tomorrow's plan from your ordinary capacity, not today's peak."], tone: "sage" },
      { blockId: "momentum-quote", type: "quote", content: "A strong day can be a gift without becoming a contract.", items: [], tone: "sage" },
      { blockId: "momentum-heading-two", type: "heading-2", content: "Protect the return", items: [], tone: "sage" },
      { blockId: "momentum-close", type: "paragraph", content: "Sustainable progress is not flat or perfectly balanced. It makes room for intense stretches while protecting the conditions that allow you to return: sleep, connection, nourishment, movement, and unclaimed time.", items: [], tone: "sage" },
      { blockId: "momentum-callout", type: "callout", content: "If major changes in energy, sleep, or behavior feel difficult to manage, consider speaking with a qualified health professional. Curevo does not diagnose or treat health conditions.", items: [], tone: "rose" },
    ],
  },
  {
    slug: "when-motivation-arrives-in-a-burst",
    category: "Routines",
    title: "When motivation arrives in a burst",
    excerpt: "Turn a flash of motivation into a small repeatable routine that still works after the excitement becomes quieter.",
    tags: ["motivation", "routines", "tiny-steps"],
    featured: false,
    coverImage: "/journal/when-motivation-arrives.png",
    coverAlt: "An animated figure moving through an expansive field of vivid golden and orange light.",
    metaTitle: "When motivation arrives in a burst | Curevo Journal",
    metaDescription: "Translate a burst of motivation into a tiny, repeatable routine that remains approachable on lower-energy days.",
    canonicalUrl: "",
    viewCount: 93,
    publishedAt: new Date("2026-08-17T08:30:00.000Z"),
    blocks: [
      { blockId: "motivation-opening", type: "paragraph", content: "Motivation is excellent at beginnings. It offers a vivid picture of what could change and briefly makes effort feel lighter. Its less glamorous job is to help you design what happens when that brightness fades.", items: [], tone: "sage" },
      { blockId: "motivation-heading", type: "heading-2", content: "Use the energy to lower future friction", items: [], tone: "sage" },
      { blockId: "motivation-body", type: "paragraph", content: "Instead of spending the whole burst doing as much as possible, spend part of it preparing an easier return. Put the item where you will see it, write the first instruction, schedule a modest window, or ask someone to check in.", items: [], tone: "sage" },
      { blockId: "motivation-list", type: "bulleted-list", content: "", items: ["Define a two-minute version of the routine.", "Attach it to something that already happens.", "Keep the materials ready and visible.", "Track returns, not perfect streaks."], tone: "sage" },
      { blockId: "motivation-callout", type: "callout", content: "Example: instead of promising an hour of reading every evening, place the book beside your charger and begin with one page after plugging in your phone.", items: [], tone: "violet" },
      { blockId: "motivation-heading-two", type: "heading-2", content: "Quiet repetition still counts", items: [], tone: "sage" },
      { blockId: "motivation-close", type: "paragraph", content: "The routine does not need to recreate the original excitement. It only needs to remain available. Each small return keeps the path familiar enough that a future burst has somewhere useful to go.", items: [], tone: "sage" },
    ],
  },
  {
    slug: "a-small-system-for-returning",
    category: "Practice",
    title: "A small system for returning to what matters",
    excerpt: "A simple three-part loop for noticing where you are, choosing one direction, and making it easier to return tomorrow.",
    tags: ["reflection", "planning", "returning"],
    featured: false,
    coverImage: "/journal/a-small-system-for-returning.png",
    coverAlt: "A geometric green and blue symbol centered on a dark background.",
    metaTitle: "A small system for returning | Curevo Journal",
    metaDescription: "Use a simple notice, choose, and leave-a-trace loop to reconnect with meaningful work without demanding a perfect streak.",
    canonicalUrl: "",
    viewCount: 71,
    publishedAt: new Date("2026-08-15T08:30:00.000Z"),
    blocks: [
      { blockId: "return-opening", type: "paragraph", content: "Consistency is often described as never breaking the chain. Real life is usually less orderly. A useful system should expect interruption and make returning easier than starting over.", items: [], tone: "sage" },
      { blockId: "return-heading", type: "heading-2", content: "Notice, choose, leave a trace", items: [], tone: "sage" },
      { blockId: "return-step-one", type: "heading-3", content: "1. Notice", items: [], tone: "sage" },
      { blockId: "return-step-one-body", type: "paragraph", content: "Name the current condition without scoring it: scattered, ready, tired, curious, rushed. The label is context, not a verdict.", items: [], tone: "sage" },
      { blockId: "return-step-two", type: "heading-3", content: "2. Choose", items: [], tone: "sage" },
      { blockId: "return-step-two-body", type: "paragraph", content: "Pick one direction that fits the condition you named. On a spacious day it may be a full focus session. On a crowded day it may be opening the document and writing the next question.", items: [], tone: "sage" },
      { blockId: "return-step-three", type: "heading-3", content: "3. Leave a trace", items: [], tone: "sage" },
      { blockId: "return-step-three-body", type: "paragraph", content: "End by leaving a visible clue for your future self: a checked box, a sentence about what comes next, or the materials placed together. The trace turns today's effort into tomorrow's doorway.", items: [], tone: "sage" },
      { blockId: "return-quote", type: "quote", content: "The measure of a practice is not whether you drift. It is whether there is a kind way back.", items: [], tone: "sage" },
      { blockId: "return-callout", type: "callout", content: "Curevo reflections are private prompts for self-guided awareness. They do not produce a medical, mental-health, productivity, or risk assessment.", items: [], tone: "sage" },
    ],
  },
];

try {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_WRITES !== "true") throw new Error("Production content migration is disabled");
  await connectDB();
  const admin = await User.findOne({ role: "admin", status: "active" }).sort({ createdAt: 1 });
  if (!admin) throw new Error("An active administrator is required before starter content can be migrated");
  let inserted = 0;
  for (const post of starters) {
    const result = await BlogPost.updateOne(
      { slug: post.slug },
      { $setOnInsert: { ...post, status: "published", authorId: admin._id, lastEditedBy: admin._id } },
      { upsert: true },
    );
    inserted += result.upsertedCount;
  }
  console.log(JSON.stringify({ starterPosts: starters.length, inserted, preserved: starters.length - inserted }, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => undefined);
}
