import type { ReactNode } from 'react';
import type { SbBlokData } from './types';

/**
 * Symbol used to identify serverBlock entries in the component map.
 */
export const SERVER_BLOCK_TAG = Symbol.for('storyblok-server-block');

/**
 * A server block entry in the component map.
 * Contains the render function (a server action) that renders the component server-side.
 */
export interface ServerBlockEntry {
  $$type: typeof SERVER_BLOCK_TAG;
  render: (blok: SbBlokData) => Promise<ReactNode>;
}

/**
 * Wraps a server render function to mark it as a server-rendered block.
 *
 * Use this in your component map for components that need server-side capabilities
 * (env secrets, DB calls, etc.) during live editing.
 *
 * On initial server render: the function is called directly, works like any async component.
 * During live editing (structural changes): the SDK calls this as a server action
 * to get fresh server-rendered JSX for the block.
 *
 * Field-level edits on existing blocks are still handled by SbField client-side
 * without triggering the server action.
 *
 * @example
 * ```tsx
 * // In a "use server" file or inline in a server component:
 * async function renderFeature(blok: SbBlokData) {
 *   "use server";
 *   const secret = await getSecretToken();
 *   return (
 *     <div {...storyblokEditable(blok)}>
 *       <h2>{blok.name}</h2>
 *       <p>🔐 {secret.slice(0, 3)}…</p>
 *     </div>
 *   );
 * }
 *
 * // In your component map:
 * const components = {
 *   teaser: Teaser,                    // regular component (client-renderable)
 *   feature: serverBlock(renderFeature), // server action (rendered server-side)
 * };
 * ```
 */
export function serverBlock(
  renderFn: (blok: SbBlokData) => Promise<ReactNode>,
): ServerBlockEntry {
  return {
    $$type: SERVER_BLOCK_TAG,
    render: renderFn,
  };
}

/**
 * Checks if a component map entry is a server block.
 */
export function isServerBlock(entry: unknown): entry is ServerBlockEntry {
  return (
    entry !== null &&
    typeof entry === 'object' &&
    (entry as ServerBlockEntry).$$type === SERVER_BLOCK_TAG
  );
}
