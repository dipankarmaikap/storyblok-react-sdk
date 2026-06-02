import { welcome } from "@storyblok/react";
import { StoryblokComponent, client } from "./lib/storyblok";
import { renderContent } from "./lib/actions";
import LiveRefresh from "./lib/LiveRefresh";

export default async function Home() {
  const { data } = await client.stories.get("home", { query: { version: 'draft' } });
  const story = data?.story;

  if (!story) {
    return <div>Story not found</div>;
  }

  return (
    <main>
      <h1>{welcome("to Next.js App Router!")}</h1>
      <LiveRefresh story={story} render={renderContent}>
        <StoryblokComponent blok={story.content} />
      </LiveRefresh>
    </main>
  );
}
