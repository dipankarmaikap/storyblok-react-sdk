import { type SbBlokData, storyblokEditable } from "@storyblok/react";
import { StoryblokBlocks } from "../lib/storyblok";

interface GridProps {
  blok: SbBlokData & { columns: SbBlokData[] };
}

export default function Grid({ blok }: GridProps) {
  if (!blok.columns || blok.columns.length === 0) {
    return null;
  }
  return (
    <section className="grid" {...storyblokEditable(blok)}>
      <StoryblokBlocks blocks={blok.columns} />
    </section>
  );
};
