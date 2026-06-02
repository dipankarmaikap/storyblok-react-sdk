import { createApiClient, createStoryblokRenderer, type ResolverConfig } from "@storyblok/react";
import Page from "../components/Page";
import Grid from "../components/Grid";
import Teaser from "../components/Teaser";
import Feature from "../components/Feature";
import FallbackBlock from "../components/FallbackBlock";
import FeaturedArticles from "../components/FeaturedArticles";
import SuspenseFallback from "../components/SuspenseFallback";

const accessToken = process.env.NEXT_PUBLIC_STORYBLOK_API_KEY!;

export const client = createApiClient({
  accessToken,
});

const resolveConfig: ResolverConfig = {
  fallback: FallbackBlock,
  cacheKeys: {
     'featured-articles': (blok) => {
    let articlesKey = '';
    const articles = blok.articles;
    if (Array.isArray(articles)) {
      articlesKey = articles
        .map((article) => {
          if (typeof article === 'string') {
            return article;
          }

          if (article && typeof article === 'object') {
            return article.uuid;
          }
          return '';
        })
        .join(',');
    }
    return [
      blok._uid,
      blok.title ?? '',
      articlesKey,
    ].join('|');
  },
  },
  suspenseFallback: SuspenseFallback,
};
export const { StoryblokComponent, StoryblokBlocks } = createStoryblokRenderer(
  {
    page: Page,
    grid: Grid,
    feature: Feature,
    teaser: Teaser,
    'featured-articles': FeaturedArticles,

  },
  resolveConfig
);
