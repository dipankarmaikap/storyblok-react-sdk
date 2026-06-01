'use client';
import { type ISbStoryData } from "@storyblok/react";
import { StoryblokComponent } from "./storyblok";
import { useStoryblokPreview } from "@storyblok/react/client";

function StoryblokPreview({ story }: { story: ISbStoryData | null }) {
  const liveStory = useStoryblokPreview(story);

  if (!liveStory) {
    return null;
  }

  return <StoryblokComponent blok={liveStory?.content} />;
}

export default StoryblokPreview;
