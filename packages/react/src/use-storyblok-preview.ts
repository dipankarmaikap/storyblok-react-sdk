import { type BridgeParams, onStoryblokEditorEvent } from '@storyblok/live-preview';
import type { ISbStoryData } from '@storyblok/js';
import { useEffect, useState } from 'react';

export function useStoryblokPreview<T = unknown>(
    story: ISbStoryData<T> | null,
    options: BridgeParams = {},
): ISbStoryData<T> | null {

    const [bridgeStory, setBridgeStory] = useState<ISbStoryData<T> | null>(story);
    const storyId = story?.id ?? null;
    
    useEffect(() => {
        let dispose: (() => void) | undefined;
        let cancelled = false;

        async function setup() {
            const cleanup = await onStoryblokEditorEvent(
                (story) => {
                    setBridgeStory(story as ISbStoryData<T>);
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
