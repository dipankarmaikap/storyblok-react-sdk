import { type SbBlokData, storyblokEditable } from "@storyblok/react";
import { StoryblokBlocks } from "../lib/storyblok";

interface PageProps {
  blok: SbBlokData & { body: SbBlokData[] };
}
export default function Page({ blok }: PageProps) {
  return (
    <section {...storyblokEditable(blok)}>
      {
        blok.body ?
          <StoryblokBlocks blocks={blok.body} /> : null
      }
    </section>
  );
}
