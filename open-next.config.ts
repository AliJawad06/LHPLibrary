import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every route in this app is dynamic (Convex-backed, no ISR/PPR), so no
// incremental cache (R2/KV) is configured.
export default defineCloudflareConfig();
