import { cloneElement, isValidElement, use } from "react";
import type { ReactElement, ReactNode } from "react";
import type { ComponentMap } from "./create-resolver";
import { createResolver, ResolverConfig } from "./create-resolver";
import type { SbBlokData } from "./types";

const promiseCache = new Map<string, WeakMap<object, Promise<unknown>>>();

function withSuppressHydrationWarning(element: unknown): ReactNode {
  if (isValidElement(element)) {
    return cloneElement(
      element as ReactElement<{ suppressHydrationWarning?: boolean }>,
      { suppressHydrationWarning: true }
    );
  }
  return element as ReactNode;
}

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
    const result = (Component as Function)({ blok });
    if (!(result instanceof Promise)) {
      return withSuppressHydrationWarning(result);
    }

    const componentName = blok.component!;
    let compCache = promiseCache.get(componentName);
    if (!compCache) {
      compCache = new WeakMap();
      promiseCache.set(componentName, compCache);
    }

    let promise = compCache.get(blok);
    if (!promise) {
      promise = result.catch((err: unknown) => {
        compCache!.delete(blok);
        throw err;
      });
      compCache.set(blok, promise);
    }

    return withSuppressHydrationWarning(use(promise));
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
