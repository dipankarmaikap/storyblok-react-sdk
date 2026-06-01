import { createApiClient, createStoryblokRenderer } from "@storyblok/react";
import Page from "../components/Page";
import Grid from "../components/Grid";
import Teaser from "../components/Teaser";
import Feature from "../components/Feature";
import FallbackBlock from "../components/FallbackBlock";

const accessToken = import.meta.env.VITE_STORYBLOK_API_KEY;
export const enableLivePreview = import.meta.env.VITE_STORYBLOK_ENABLE_LIVEPREVIEW === "true";


export const client = createApiClient({
  accessToken,
});

export const { StoryblokComponent, StoryblokBlocks } = createStoryblokRenderer(
  {
    page: Page,
    grid: Grid,
    feature: Feature,
    teaser: Teaser,

  },
  { fallback: FallbackBlock }
);
