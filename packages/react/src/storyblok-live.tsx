import { useEffect, useRef } from 'react';
import { onStoryblokEditorEvent } from '@storyblok/live-preview';
import type { SbBlokData } from './types';

interface StoryblokLiveProps {
  /**
   * Called when the block structure changes (blocks added, removed, or reordered).
   * The user wires this to their framework's refresh mechanism.
   *
   * Examples:
   * - Next.js: `() => router.refresh()`
   * - React Router: `() => revalidate()`
   * - Generic: `() => window.location.reload()`
   */
  onRefresh: () => void;

  /**
   * The story content object to monitor for structural changes.
   * Pass the same object you pass to StoryblokComponent.
   */
  story: { content?: SbBlokData } | null;
}

/**
 * Extracts all _uid values from a content tree in order.
 * This creates a "fingerprint" of the block structure.
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

/**
 * A client component that subscribes to Storyblok bridge events and
 * detects structural changes (blocks added, removed, or reordered).
 *
 * When a structural change is detected, it calls `onRefresh` so the user
 * can trigger their framework's refresh mechanism.
 *
 * Field-level edits (text changes) are NOT treated as structural changes —
 * those are handled by `SbField` components.
 *
 * In production (outside the Visual Editor), this component renders nothing
 * and has no runtime overhead.
 */
export function StoryblokLive({ onRefresh, story }: StoryblokLiveProps) {
  const structureRef = useRef<string>(extractUids(story?.content));

  useEffect(() => {
    // Update fingerprint when story prop changes (e.g., after a refresh)
    structureRef.current = extractUids(story?.content);
  }, [story]);

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | null = null;

    async function subscribe() {
      const cleanup = await onStoryblokEditorEvent((updatedStory: unknown) => {
        if (cancelled) return;

        const storyObj = updatedStory as { content?: unknown };
        if (!storyObj.content) return;

        const newStructure = extractUids(storyObj.content);
        if (newStructure !== structureRef.current) {
          structureRef.current = newStructure;
          onRefresh();
        }
      });

      if (cancelled) {
        cleanup();
      } else {
        dispose = cleanup;
      }
    }

    void subscribe();

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [onRefresh]);

  return null;
}
