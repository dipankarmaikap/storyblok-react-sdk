import { Suspense, cloneElement, isValidElement, use } from "react";
import type { ElementType, ReactElement, ReactNode } from "react";
import { createResolver, type ComponentMapProvider, type ResolverConfig } from "./create-resolver";
import type { SbBlokData } from "./types";
import { createPromiseCache } from "./promise-cache";

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
  const fallback = config?.suspenseFallbacks?.[componentName]
    ?? config?.suspenseFallback;
  if (fallback == null) return <div className="storyblok-blok-loading" />;
  if (typeof fallback === "function") {
    const Comp = fallback as ElementType;
    return <Comp />;
  }
  return fallback as ReactNode;
}

function getCacheKey(config: ResolverConfig | undefined, componentName: string, blok: SbBlokData) {
  const fn = config?.cacheKeys?.[componentName];
  if (fn) return fn(blok);
  const parts: string[] = [];
  for (const key in blok) {
    const value = blok[key];
    if (typeof value === 'string') {
      parts.push(`${key}:${value}`);
    }
  }
  return parts.length > 0 ? parts.join('|') : blok._uid ?? null;
}

export function createStoryblokRenderer(
  components: ComponentMapProvider,
  config?: ResolverConfig
) {
  const resolver = createResolver(components, config);
  const cache = createPromiseCache();

  function AsyncBlok({ promise, cacheKey, componentName }: {
    promise: Promise<unknown>;
    cacheKey: unknown;
    componentName: string;
  }) {
    return withSuppressHydrationWarning(use(cache.getOrSet(promise, cacheKey, componentName)) as ReactNode);
  }

  function StoryblokComponent({ blok }: { blok: SbBlokData }) {
    const resolved = resolver(blok.component || "");
    if (!resolved) {
      return null;
    }

    const componentName = blok.component!;
    const fallback = getSuspenseFallback(config, componentName);

    // Handle serverBlock entries
    if (resolved.type === 'serverBlock') {
      const cacheKey = getCacheKey(config, componentName, blok);
      // Call the render function directly — on the server it's a direct call,
      // on the client it's a server action (RPC to server). Both return a Promise.
      const promise = resolved.entry.render(blok);

      if (!hasUse) {
        console.warn(
          `[Storyblok SDK] serverBlock "${componentName}" requires React 19+ (use() hook).`
        );
        return <Suspense fallback={fallback}>{fallback}</Suspense>;
      }

      if (cacheKey != null) {
        return (
          <Suspense fallback={fallback}>
            <AsyncBlok promise={promise} cacheKey={cacheKey} componentName={componentName} />
          </Suspense>
        );
      }

      return (
        <Suspense fallback={fallback}>
          {withSuppressHydrationWarning(use(promise) as ReactNode)}
        </Suspense>
      );
    }

    // Regular component handling (unchanged)
    const Component = resolved.Component;
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

    // Client: plain functions are called directly to detect async (Promise return).
    // Class components, forwardRef, memo, etc. use JSX.
    const isPlainFunction = typeof Component === "function" && !(Component.prototype as any)?.isReactComponent;

    if (isPlainFunction) {
      const result = (Component as Function)({ blok });

      if (result instanceof Promise) {
        if (!hasUse) {
          console.warn(
            `[Storyblok SDK] Component "${componentName}" is async and requires React 19+.`
          );
          return (
            <Suspense fallback={fallback}>
              {fallback}
            </Suspense>
          );
        }
        // Cache key present → deduplicate in-flight promises via cache.
        // Default key is derived from all string values in the blok.
        if (cacheKey != null) {
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
        // No caching — pass the promise to React's use() directly.
        return (
          <Suspense fallback={fallback}>
            {withSuppressHydrationWarning(use(result) as ReactNode)}
          </Suspense>
        );
      }

      // Sync component: use JSX so Fast Refresh can track instances.
      return (
        <Suspense fallback={fallback}>
          {withSuppressHydrationWarning(<Component blok={blok} />)}
        </Suspense>
      );
    }

    // Non-function components (class, forwardRef, memo, strings) — use JSX
    return (
      <Suspense fallback={fallback}>
        {withSuppressHydrationWarning(<Component blok={blok} />)}
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
