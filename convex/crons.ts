import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "sync pickup events from Google Calendar",
  { hours: 1 },
  internal.events.sync,
  {},
);

export default crons;
