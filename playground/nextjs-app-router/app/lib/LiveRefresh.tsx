'use client';

import type { ReactNode } from 'react';
import { StoryblokLivePreview } from '@storyblok/react/client';
import type { Story, SbBlokData } from '@storyblok/react';

interface LiveRefreshProps {
  story: Story | null;
  render: (content: SbBlokData) => Promise<ReactNode>;
  children: ReactNode;
}

/**
 * Thin wrapper connecting StoryblokLivePreview to the playground's page.
 *
 * - Shows server-rendered children by default (SbField handles field edits)
 * - On structural changes (blocks added/removed/reordered), calls the
 *   `render` server action which re-renders the content tree on the server
 *   with full capabilities (secrets, DB, etc.) and returns JSX
 */
export default function LiveRefresh({ story, render, children }: LiveRefreshProps) {
  return (
    <StoryblokLivePreview story={story} render={render}>
      {children}
    </StoryblokLivePreview>
  );
}
