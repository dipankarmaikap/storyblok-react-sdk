import { welcome } from "@storyblok/react";
import { StoryblokComponent, enableLivePreview, client } from "./lib/storyblok";
import StoryblokPreview from "./lib/StoryblokPreview";

export default async function Home() {
  const { data } = await client.stories.get("home", { query: { version: 'draft' } });
  const story = data?.story;

  if (!story) {
    return <div>Story not found</div>;
  }

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
