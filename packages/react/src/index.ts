export function welcome(name: string) {
  return `Welcome, ${name}`;
}

export { createApiClient, type ContentApiClientConfig, type Story } from "@storyblok/api-client";
export * from "./create-resolver";
export { createStoryblokRenderer } from "./create-storyblok-renderer";
export { storyblokEditable } from "@storyblok/live-preview";

export type { SbBlokData } from "./types";
