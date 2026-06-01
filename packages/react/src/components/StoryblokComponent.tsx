import type { StoryblokResolver } from "../create-resolver";
import type { SbBlokData } from "@storyblok/js";

interface StoryblokComponentProps {
  blok: SbBlokData;
  resolver: StoryblokResolver;
}

export default function StoryblokComponent({ blok, resolver }: StoryblokComponentProps) {
  const Component = resolver(blok.component || "");
  if (!Component) {
    return null;
  }
  return <Component blok={blok} />;
}
