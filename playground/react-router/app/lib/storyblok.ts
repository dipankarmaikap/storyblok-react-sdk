import { storyblokInit, apiPlugin, createStoryblokRenderer } from "@storyblok/react";
import Page from "../components/Page";
import Grid from "../components/Grid";
import Teaser from "../components/Teaser";
import Feature from "../components/Feature";
import FallbackBlock from "../components/FallbackBlock";

const accessToken = import.meta.env.VITE_STORYBLOK_API_KEY;
export const enableLivePreview = import.meta.env.VITE_STORYBLOK_ENABLE_LIVEPREVIEW === "true";


const { storyblokApi } = storyblokInit({
  accessToken,
  apiOptions: {
    region: "eu",
  },
  use: [apiPlugin],
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


export { storyblokApi };

