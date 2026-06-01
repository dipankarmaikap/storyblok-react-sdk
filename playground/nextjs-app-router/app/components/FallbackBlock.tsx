import { type SbBlokData } from "@storyblok/react";

interface FallbackBlockProps {
  blok: SbBlokData;
}
export default function FallbackBlock({ blok }: FallbackBlockProps) {
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Component not registered for{" "}
      <code className="rounded bg-amber-100 px-1 py-0.5">
        {blok.component}
      </code>
    </div>
  );
}
