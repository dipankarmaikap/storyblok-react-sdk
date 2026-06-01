import { Suspense, cloneElement, isValidElement, use } from "react";
import type { ElementType, ReactElement, ReactNode } from "react";
import type { ComponentMap } from "./create-resolver";
import { createResolver, ResolverConfig } from "./create-resolver";
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
  const fn = config?.cacheKeys?.[componentName] ?? ((b: SbBlokData) => b._uid ?? b);
  return fn(blok);
}

export function createStoryblokRenderer(
  components: ComponentMap,
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

    // Client: function components can be called directly to detect async for use()
    // Class components, forwardRef, memo, etc. must use JSX.
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

      return (
        <Suspense fallback={fallback}>
          {withSuppressHydrationWarning(result)}
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
