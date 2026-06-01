import { Suspense, cloneElement, isValidElement, use } from "react";
import type { ReactElement, ReactNode } from "react";
import type { ComponentMap } from "./create-resolver";
import { createResolver, ResolverConfig } from "./create-resolver";
import type { SbBlokData } from "./types";

const promiseCache = new Map<string, Map<unknown, Promise<unknown>>>();
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

function getSuspenseFallback(config: ResolverConfig | undefined, componentName: string) {
  return config?.suspenseFallbacks?.[componentName]
    ?? config?.suspenseFallback
    ?? <div className="storyblok-blok-loading" />;
}

function getCacheKey(config: ResolverConfig | undefined, componentName: string, blok: SbBlokData) {
  const fn = config?.cacheKeys?.[componentName] ?? ((b: SbBlokData) => b._uid ?? b);
  return fn(blok);
}

function useCachedPromise(promise: Promise<unknown>, cacheKey: unknown, componentName: string) {
  let compCache = promiseCache.get(componentName);
  if (!compCache) {
    compCache = new Map();
    promiseCache.set(componentName, compCache);
  }
  let cached = compCache.get(cacheKey);
  if (!cached) {
    cached = promise.catch((err: unknown) => {
      compCache!.delete(cacheKey);
      throw err;
    });
    compCache.set(cacheKey, cached);
  }
  return use(cached) as ReactNode;
}

function AsyncBlok({ promise, cacheKey, componentName }: {
  promise: Promise<unknown>;
  cacheKey: unknown;
  componentName: string;
}) {
  return withSuppressHydrationWarning(useCachedPromise(promise, cacheKey, componentName));
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

    const componentName = blok.component!;
    const fallback = getSuspenseFallback(config, componentName);
    const cacheKey = getCacheKey(config, componentName, blok);

    // Server (RSC/SSR): use JSX to preserve client/server boundary.
    // Async components work natively in RSC with Suspense.
    if (isServer) {
      return (
        <Suspense fallback={fallback}>
          {withSuppressHydrationWarning(<Component blok={blok} />)}
        </Suspense>
      );
    }

    // Client: call directly to detect async components for use()
    const result = (Component as Function)({ blok });

    if (result instanceof Promise) {
      if (!hasUse) {
        console.warn(
          `[Storyblok SDK] Component "${componentName}" is async and requires React 19+.`
        );
        return null;
      }
      return (
        <Suspense fallback={fallback}>
          <AsyncBlok
            promise={result}
            cacheKey={cacheKey}
            componentName={componentName}
          />
        </Suspense>
      );
    }

    // Sync component on client — wrap in Suspense to match server tree for hydration
    return (
      <Suspense fallback={fallback}>
        {withSuppressHydrationWarning(result)}
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
