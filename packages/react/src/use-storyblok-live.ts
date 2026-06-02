import { type Story } from '@storyblok/api-client';
import { type BridgeParams, onStoryblokEditorEvent } from '@storyblok/live-preview';
import { useEffect, useRef, useState } from 'react';
import type { SbBlokData } from './types';

/**
 * Extracts all _uid values from a content tree in order.
 * Creates a "fingerprint" of the block structure.
 */
function extractUids(content: unknown): string {
  if (!content || typeof content !== 'object') return '';

  if (Array.isArray(content)) {
    return content.map(extractUids).join(',');
  }

  const obj = content as Record<string, unknown>;
  const parts: string[] = [];

  if (typeof obj._uid === 'string') {
    parts.push(obj._uid);
  }

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (Array.isArray(value)) {
      parts.push(`${key}:[${extractUids(value)}]`);
    }
  }

  return parts.join('|');
}

export interface UseStoryblokLiveResult {
  /** The current live story (updated on every bridge event) */
  story: Story | null;
  /**
   * Whether the block structure has changed from the initial server render.
   * When true, the consumer should switch from showing server-rendered content
   * to client-side rendering with the live story data.
   */
  structureChanged: boolean;
}

/**
 * Hook that subscribes to Storyblok Visual Editor bridge events and tracks
 * both the live story state and whether the block structure has changed.
 *
 * Designed for the "two-mode" RSC pattern:
 * - While `structureChanged` is false: show server-rendered children
 *   (field-level updates are handled by SbField independently)
 * - When `structureChanged` becomes true: switch to client-side rendering
 *   using the live `story` data (server-only data like secrets gracefully
 *   degrades to null during preview, which is acceptable)
 *
 * @param initialStory - The story fetched on the server (passed as a prop)
 * @param options - Optional bridge configuration
 */
export function useStoryblokLive(
  initialStory: Story | null,
  options: BridgeParams = {},
): UseStoryblokLiveResult {
  const [liveStory, setLiveStory] = useState<Story | null>(initialStory);
  const [structureChanged, setStructureChanged] = useState(false);

  // Track the structure fingerprint from the server-rendered story
  const serverStructureRef = useRef<string>(
    extractUids((initialStory as unknown as { content?: SbBlokData })?.content),
  );

  // Reset when the server provides a new story (e.g., navigation or after save)
  useEffect(() => {
    const newStructure = extractUids(
      (initialStory as unknown as { content?: SbBlokData })?.content,
    );
    serverStructureRef.current = newStructure;
    setLiveStory(initialStory);
    setStructureChanged(false);
  }, [initialStory]);

  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;

    async function setup() {
      const cleanup = await onStoryblokEditorEvent(
        (updatedStory) => {
          if (cancelled) return;
          const story = updatedStory as Story;
          setLiveStory(story);

          // Check if structure changed from the server render
          const storyObj = updatedStory as { content?: unknown };
          const newStructure = extractUids(storyObj.content);
          if (newStructure !== serverStructureRef.current) {
            setStructureChanged(true);
          }
        },
        options,
      );

      if (!cancelled) {
        dispose = cleanup;
      } else {
        cleanup();
      }
    }

    void setup();

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [initialStory?.id, options]);

  return { story: liveStory, structureChanged };
}
