'use server';

import type { SbBlokData } from '@storyblok/react';
import type { ReactNode } from 'react';
import { StoryblokComponent } from './storyblok';

/**
 * Server action that renders the full content tree server-side.
 *
 * Called by StoryblokLivePreview when a structural change is detected
 * (blocks added, removed, or reordered in the Visual Editor).
 *
 * All components run on the server with full capabilities — env secrets,
 * DB calls, async data fetching — and the rendered JSX is returned to
 * the client for React to reconcile.
 */
export async function renderContent(content: SbBlokData): Promise<ReactNode> {
  return <StoryblokComponent blok={content} />;
}
