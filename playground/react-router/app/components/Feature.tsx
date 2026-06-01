import { type SbBlokData, storyblokEditable } from "@storyblok/react";

interface FeatureProps {
  blok: SbBlokData & { name: string; description: string };
}

export default function Feature({ blok }: FeatureProps) {
  return (
    <div className="feature" {...storyblokEditable(blok)}>
      <h2 className="text-2xl font-bold">{blok.name}</h2>
      <p>{blok.description}</p>
    </div>
  );
}
