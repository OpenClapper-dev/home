/**
 * What the page and the Worker must agree on: the positions people can pick, and the shape and
 * limits of the two submissions. The Worker validates with these so a form change cannot drift
 * from what the API accepts.
 */
export * from "./positions.ts";
export * from "./submissions.ts";
