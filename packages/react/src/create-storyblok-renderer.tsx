import { Suspense, cloneElement, isValidElement, use } from "react";
import type { ReactElement, ReactNode } from "react";
import type { ComponentMap } from "./create-resolver";
import { createResolver, ResolverConfig } from "./create-resolver";
import type { SbBlokData } from "./types";

const promiseCache = new Map<string, WeakMap<object, Promise<unknown>>>();
const hasUse = typeof use === "function";
const isServer = typeof window === "undefined";

function withSuppressHydrationWarning(element: unknown): ReactNode {
  if (isValidElement(element)) {
    return cloneElement(
      element as ReactElement<{ suppressHydrationWarning?: boolean }>,
      { suppressHydrationWarning: true }
    );
  }
  return element as ReactNode;
}

function useCachedPromise(promise: Promise<unknown>, blok: SbBlokData, componentName: string) {
  let compCache = promiseCache.get(componentName);
  if (!compCache) {
    compCache = new WeakMap();
    promiseCache.set(componentName, compCache);
  }
  let cached = compCache.get(blok);
  if (!cached) {
    cached = promise.catch((err: unknown) => {
      compCache!.delete(blok);
      throw err;
    });
    compCache.set(blok, cached);
  }
  return use(cached) as ReactNode;
}

function AsyncBlok({ promise, blok, componentName }: {
  promise: Promise<unknown>;
  blok: SbBlokData;
  componentName: string;
}) {
  return withSuppressHydrationWarning(useCachedPromise(promise, blok, componentName));
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

    // Server (RSC/SSR): use JSX to preserve client/server boundary.
    // Async components work natively in RSC with Suspense.
    if (isServer) {
      return (
        <Suspense fallback={<div className="storyblok-blok-loading" />}>
          {withSuppressHydrationWarning(<Component blok={blok} />)}
        </Suspense>
      );
    }

    // Client: call directly to detect async components for use()
    const result = (Component as Function)({ blok });
    if (!(result instanceof Promise)) {
      return withSuppressHydrationWarning(result);
    }

    if (!hasUse) {
      console.warn(
        `[Storyblok SDK] Component "${blok.component}" is async and requires React 19+.`
      );
      return null;
    }

    return (
      <Suspense fallback={<div className="storyblok-blok-loading" />}>
        <AsyncBlok
          promise={result}
          blok={blok}
          componentName={blok.component!}
        />
      </Suspense>
    );
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
