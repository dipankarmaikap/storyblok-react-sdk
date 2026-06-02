import type { ElementType, ReactNode } from "react";
import type { SbBlokData } from "./types";

export type ComponentMap = Record<string, ElementType>;
export type ComponentMapProvider = ComponentMap | (() => ComponentMap);

export type ResolverConfig = {
  /**
   * Component rendered when no matching component is found.
   */
  fallback?: ElementType;

  /**
   * Default Suspense fallback shown while an async component is loading.
   * Pass a component reference or JSX.
   *
   * @default <div className="storyblok-blok-loading" />
   */
  suspenseFallback?: ElementType | ReactNode;

  /**
   * Per-component Suspense fallback overrides. Keyed by the Storyblok component name.
   * Pass a component reference or JSX.
   */
  suspenseFallbacks?: Record<string, ElementType | ReactNode>;

  /**
   * Per-component cache keys for async components.
   *
   * Async component results are cached automatically using all string values
   * from the blok as the cache key — Storyblok content edits naturally
   * invalidate the cache.
   *
   * Provide a custom function when the default key is not granular enough
   * (e.g. nested objects/arrays) or to reduce key size. Return `null` to
   * opt out of caching for a specific component.
   *
   * @example
   * ```ts
   * cacheKeys: {
   *   'featured-articles': (blok) =>
   *     [blok._uid, blok.title, (blok.articles ?? []).map((a) => a.uuid).join(',')].join('|')
   * }
   * ```
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
 * Creates an isolated resolver instance.
 * Accepts either a static ComponentMap or a factory function that returns one.
 * Using a factory function ensures live ES module bindings are read on every
 * render, which makes HMR / Fast Refresh work correctly when component source
 * files change.
 */
export function createResolver(
  components: ComponentMapProvider,
  config?: ResolverConfig
): StoryblokResolver {
  const getComponents = typeof components === 'function' ? components : () => components;

  return function resolve(blockName: string): ElementType | null {
    const map = getComponents();
    const Component = map[blockName];
    if (Component) {
      return Component;
    }
    if (config?.fallback) {
      return config.fallback;
    }
    if (config?.warnMissingComponents !== false) {
      console.warn(`[Storyblok SDK] Component "${blockName}" is not registered.`);
    }
    return null;
  };
}
