import { storyblokInit, apiPlugin } from "@storyblok/js";

export function welcome(name: string) {
  return `Welcome, ${name}`;
}

export { storyblokInit, apiPlugin };
export * from "./create-resolver";
export { createStoryblokRenderer } from "./create-storyblok-renderer";
export type { SbBlokData, ISbStoryData } from "@storyblok/js";
export { storyblokEditable } from "@storyblok/live-preview";
