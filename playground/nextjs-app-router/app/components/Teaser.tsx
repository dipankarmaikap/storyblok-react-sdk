'use client';
import { type SbBlokData, storyblokEditable } from "@storyblok/react";
import { useState } from "react";

interface TeaserProps {
  blok: SbBlokData & { headline: string };
}

export default function Teaser({ blok }: TeaserProps) {
  const [count, setCount] = useState(0);
  return (
    <div className="teaser" {...storyblokEditable(blok)}>
      <h2>{blok.headline}</h2>
      <button onClick={() => setCount(count + 1)}>Counter {count}</button>
    </div>
  );
}
