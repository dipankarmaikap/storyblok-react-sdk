import type { ComponentMap } from "./create-resolver";
import { createResolver, ResolverConfig } from "./create-resolver";
import type { SbBlokData } from "@storyblok/js";

export function createStoryblokRenderer(
  components: ComponentMap,
  config?: ResolverConfig
) {
  const resolver = createResolver(components, config);

  function StoryblokComponent({ blok }: { blok: SbBlokData }) {
    const Component = resolver(blok.component || "");
    if (!Component) {
      return null;
    }
    return <Component blok={blok} />;
  }

  function StoryblokBlocks({ blocks }: { blocks: SbBlokData[] }) {
    return blocks.map((blok) => (
      <StoryblokComponent
        key={blok._uid}
        blok={blok}
      />
    ));
  }

  return {
    StoryblokComponent,
    StoryblokBlocks,
  };
}
