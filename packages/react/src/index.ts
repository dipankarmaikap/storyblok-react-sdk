export function welcome(name: string) {
  return `Welcome, ${name}`;
}

export { createApiClient, type ContentApiClientConfig, type Story } from "@storyblok/api-client";
export * from "./create-resolver";
export { createStoryblokRenderer } from "./create-storyblok-renderer";
export { storyblokEditable } from "@storyblok/live-preview";
export { serverBlock, isServerBlock, SERVER_BLOCK_TAG } from "./server-block";
export type { ServerBlockEntry } from "./server-block";

export type { SbBlokData } from "./types";
