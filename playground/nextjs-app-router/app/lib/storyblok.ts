import { createApiClient, createStoryblokRenderer, type ResolverConfig } from "@storyblok/react";
import Page from "../components/Page";
import Grid from "../components/Grid";
import Teaser from "../components/Teaser";
import Feature from "../components/Feature";
import FallbackBlock from "../components/FallbackBlock";
import PostComponent from "../components/PostComponent";
import SuspenseFallback from "../components/SuspenseFallback";

const accessToken = process.env.NEXT_PUBLIC_STORYBLOK_API_KEY!;
export const enableLivePreview = process.env.NEXT_PUBLIC_STORYBLOK_ENABLE_LIVEPREVIEW === "true";
export const client = createApiClient({
  accessToken,
});

const resolveConfig: ResolverConfig = {
  fallback: FallbackBlock,
  cacheKeys: {
    'featured-articles': (blok) => `${blok._uid}-${blok?.title}`,
  },
  suspenseFallback: SuspenseFallback,
};
export const { StoryblokComponent, StoryblokBlocks } = createStoryblokRenderer(
  {
    page: Page,
    grid: Grid,
    feature: Feature,
    teaser: Teaser,
    'featured-articles': PostComponent,

  },
  resolveConfig
);


