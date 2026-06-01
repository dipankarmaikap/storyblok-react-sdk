import { useEffect, useState } from "react";
import { welcome, type Story } from "@storyblok/react";
import "./App.css";
import { enableLivePreview, client, StoryblokComponent } from "./lib/storyblok";
import StoryblokPreview from "./lib/StoryblokPreview";

function App() {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadStory() {
      try {
        const { data } = await client.stories.get("home", {
          query: {
            version: "draft",
          },
        });

        setStory(data?.story || null);
      } catch (err) {
        console.error("Failed to fetch Storyblok story:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStory();
  }, []);

  if (loading) {
    return <main>Loading...</main>;
  }

  if (!story) {
    return <main>Story not found</main>;
  }
  if (enableLivePreview) {
    return (
    <main>
      <h1>{welcome("to Vite React App with Live Preview")}</h1>
      <StoryblokPreview story={story} />
    </main>
    );
  }
  return (
    <main>
      <h1>{welcome("to Vite React App without Live Preview")}</h1>
      <StoryblokComponent blok={story.content} />
    </main>
  );
}

export default App;
