import type { Route } from "./+types/home";
import { welcome } from "@storyblok/react";
import { enableLivePreview, storyblokApi, StoryblokComponent } from "~/lib/storyblok";
import StoryblokPreview from "~/lib/StoryblokPreview";

export async function loader({ }: Route.LoaderArgs) {
  const response = await storyblokApi?.get(`cdn/stories/home`, { version: 'draft' });
  return response?.data?.story;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const story = loaderData;
  if (enableLivePreview) {
    return (
      <main>
        <h1>{welcome("to Next.js App Router! Live Preview")}</h1>
        <StoryblokPreview story={story} />
      </main>
    )
  }
  return (
    <main>
      <h1>{welcome("to Next.js App Router! Production")}</h1>
      <StoryblokComponent blok={story.content} />
    </main>
  );
}
