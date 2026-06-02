'use client';
import { type Story } from "@storyblok/react";
import { StoryblokComponent } from "./storyblok";
import { useStoryblokPreview } from "@storyblok/react/client";

function StoryblokPreview({ story }: { story: Story | null }) {
  const liveStory = useStoryblokPreview(story,{
    resolveRelations: ['featured-articles.articles']
  });
 
  if (!liveStory) {
    return null;
  }

  return <StoryblokComponent blok={liveStory?.content} />;
}

export default StoryblokPreview;
