import type { ElementType, ReactNode } from "react";
import type { SbBlokData } from "./types";

export type ComponentMap = Record<string, ElementType>;

export type ResolverConfig = {
  /**
   * Component rendered when no matching component is found.
   */
  fallback?: ElementType;

  /**
   * Default Suspense fallback shown while an async component is loading.
   *
   * @default <div className="storyblok-blok-loading" />
   */
  suspenseFallback?: ReactNode;

  /**
   * Per-component Suspense fallback overrides. Keyed by the Storyblok component name.
   */
  suspenseFallbacks?: Record<string, ReactNode>;

  /**
   * Custom cache key functions per component.
   * Controls whether an async component's Promise is reused across renders.
   *
   * Default: `(blok) => blok._uid ?? blok` — stable, no re-fetch on unrelated edits.
   * To always re-fetch: `(blok) => Math.random()`
   * To re-fetch on version change: `(blok) => \`${blok._uid}-${blok.version}\``
   */
  cacheKeys?: Record<string, (blok: SbBlokData) => unknown>;

  /**
   * Log a warning when a component cannot be resolved.
   *
   * @default false
   */
  warnMissingComponents?: boolean;
};

export type StoryblokResolver = (blockName: string) => ElementType | null;

/**
 * Creates an isolated resolver instance to pass into <StoryblokContent />.
 */
export function createResolver(
  components: ComponentMap,
  config?: ResolverConfig
): StoryblokResolver {
  
  // Returns a closure that the renderer uses to look up components
  return function resolve(blockName: string): ElementType | null {
    const Component = components[blockName];
    if (Component) {
      return Component;
    }
    if (config?.fallback) {
      return config.fallback;
    }
    if (config?.warnMissingComponents !== false) {
      console.warn(`[Storyblok SDK] Component "${blockName}" is not registered.`);
    }
    return null; // Return null so the app doesn't crash on unknown blocks
  };
}
