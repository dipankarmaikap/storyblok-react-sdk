'use client';

import { useEffect, useRef, useState, use } from 'react';
import type { ReactNode } from 'react';
import { onStoryblokEditorEvent } from '@storyblok/live-preview';
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

interface StoryblokLivePreviewProps {
  /**
   * The story object from the server (used to detect structural changes).
   */
  story: { content?: SbBlokData } | null;

  /**
   * Server-rendered content — shown while no structural change has occurred.
   * Field-level edits are handled by SbField independently.
   */
  children: ReactNode;

  /**
   * A server action that renders the content tree server-side.
   * Called when a structural change is detected (blocks added/removed/reordered).
   *
   * The action receives the updated content (from the bridge) and should return
   * the fully rendered component tree as JSX. Server components inside
   * (with DB calls, secrets, etc.) run on the server and return their output.
   *
   * @example
   * ```tsx
   * // actions.tsx
   * "use server";
   * export async function renderContent(content: SbBlokData) {
   *   return <StoryblokComponent blok={content} />;
   * }
   * ```
   */
  render: (content: SbBlokData) => Promise<ReactNode>;
}

/**
 * Live preview island for RSC-capable frameworks (Next.js App Router).
 *
 * Shows server-rendered `children` until a structural change is detected.
 * When blocks are added, removed, or reordered:
 * - Calls the `render` server action with the updated content
 * - The server renders the full component tree (serverBlock components
 *   run with full server capabilities — secrets, DB, etc.)
 * - Returns the rendered JSX to the client
 * - React reconciles the new output
 *
 * Field-level edits on existing blocks are always handled by SbField
 * without triggering the server action.
 */
export function StoryblokLivePreview({
  story,
  children,
  render,
}: StoryblokLivePreviewProps) {
  const [liveJsx, setLiveJsx] = useState<ReactNode | null>(null);
  const serverStructureRef = useRef<string>(extractUids(story?.content));
  const pendingRef = useRef(false);

  // Reset when server provides new story (e.g., navigation)
  useEffect(() => {
    serverStructureRef.current = extractUids(story?.content);
    setLiveJsx(null);
  }, [story]);

  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;

    async function subscribe() {
      const cleanup = await onStoryblokEditorEvent(async (updatedStory) => {
        if (cancelled) return;

        const storyObj = updatedStory as unknown as { content?: SbBlokData };
        if (!storyObj.content) return;

        const newStructure = extractUids(storyObj.content);
        if (newStructure !== serverStructureRef.current) {
          // Structure changed — call server action to re-render the content tree
          if (!pendingRef.current) {
            pendingRef.current = true;
            try {
              const rendered = await render(storyObj.content);
              if (!cancelled) {
                setLiveJsx(rendered);
                serverStructureRef.current = newStructure;
              }
            } finally {
              pendingRef.current = false;
            }
          }
        }
      });

      if (!cancelled) {
        dispose = cleanup;
      } else {
        cleanup();
      }
    }

    void subscribe();

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [render]);

  // Show server-action-rendered content if structure changed,
  // otherwise show the original server-rendered children.
  return <>{liveJsx ?? children}</>;
}
