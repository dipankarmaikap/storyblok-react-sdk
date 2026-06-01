import { Story } from '@storyblok/api-client';
import { type BridgeParams, onStoryblokEditorEvent } from '@storyblok/live-preview';
import { useEffect, useState } from 'react';

export function useStoryblokPreview(
    story: Story | null,
    options: BridgeParams = {},
): Story | null {

    const [bridgeStory, setBridgeStory] = useState<Story | null>(story);
    const storyId = story?.id ?? null;
    
    useEffect(() => {
        let dispose: (() => void) | undefined;
        let cancelled = false;

        async function setup() {
            const cleanup = await onStoryblokEditorEvent(
                (story) => {
                    setBridgeStory(story as Story);
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
    }, [storyId, options]);

    return bridgeStory?.id === storyId
        ? bridgeStory
        : story;
}
