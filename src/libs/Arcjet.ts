import arcjet, { filter, shield } from "@arcjet/next";

// Create a base Arcjet instance which can be imported and extended in each route.
export default arcjet({
  // Get your site key from https://launch.arcjet.com/Q6eLbRE
  key: process.env.ARCJET_KEY ?? "",
  // Identify the user by their IP address
  characteristics: ["ip.src"],
  rules: [
    // Missing User-Agent requests can't be classified by bot detection.
    filter({
      mode: "LIVE",
      deny: ['len(http.request.headers["user-agent"]) eq 0'],
    }),
    // Protect against common attacks with Arcjet Shield
    shield({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
    }),
    // Other rules are added in different routes
  ],
});
