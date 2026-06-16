import { type SbBlokData, storyblokEditable } from "@storyblok/react";
import { StoryblokBlocks } from "../lib/storyblok";

interface PageProps {
  blok: SbBlokData & { body: SbBlokData[] };
}
export default function Page({ blok }: PageProps) {
  if (!blok.body || blok.body.length === 0) {
    return null;
  }
  return (
    <section {...storyblokEditable(blok)}>
      <StoryblokBlocks blocks={blok.body} />
    </section>
  );
}
