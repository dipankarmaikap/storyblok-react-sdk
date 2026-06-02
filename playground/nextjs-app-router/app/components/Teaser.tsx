'use client';
import { type SbBlokData, storyblokEditable } from "@storyblok/react";
import { SbField } from "@storyblok/react/client";
import { useState } from "react";

interface TeaserProps {
  blok: SbBlokData & { headline: string };
}

export default function Teaser({ blok }: TeaserProps) {
  const [count, setCount] = useState(0);
  return (
    <div className="teaser" {...storyblokEditable(blok)}>
      <h2><SbField blok={blok} field="headline" /></h2>
      <button onClick={() => setCount(count + 1)}>Counter {count}</button>
    </div>
  );
}
