import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { onStoryblokEditorEvent } from '@storyblok/live-preview';
import type { SbBlokData } from './types';

interface SbFieldProps {
  /** The blok data object containing the field */
  blok: SbBlokData;
  /** The field name to render and listen for updates */
  field: string;
  /** Optional HTML tag to wrap the output (renders as fragment if omitted) */
  as?: keyof React.JSX.IntrinsicElements;
  /** Optional className (only used when `as` is provided) */
  className?: string;
  /** Optional render function for custom rendering */
  children?: (value: unknown) => ReactNode;
}

/**
 * Recursively searches a content tree for a blok with the given _uid.
 */
function findBlokByUid(content: unknown, uid: string): SbBlokData | null {
  if (!content || typeof content !== 'object') return null;

  if (Array.isArray(content)) {
    for (const item of content) {
      const found = findBlokByUid(item, uid);
      if (found) return found;
    }
    return null;
  }

  const obj = content as Record<string, unknown>;
  if (obj._uid === uid) return obj as SbBlokData;

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value && typeof value === 'object') {
      const found = findBlokByUid(value, uid);
      if (found) return found;
    }
  }

  return null;
}

/**
 * A client component that renders a single field from a blok and
 * automatically updates it during Live Preview without re-rendering
 * the parent server component.
 *
 * In production (outside the Visual Editor), this renders the field value
 * statically with no runtime overhead.
 */
export function SbField({ blok, field, as: Tag, className, children }: SbFieldProps) {
  const initialValue = blok[field];
  const [value, setValue] = useState<unknown>(initialValue);
  const uid = blok._uid;
  const disposeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Sync state when blok prop changes (e.g. navigation)
    setValue(blok[field]);
  }, [blok, field]);

  useEffect(() => {
    if (!uid) return;

    let cancelled = false;

    async function subscribe() {
      const cleanup = await onStoryblokEditorEvent((story: unknown) => {
        if (cancelled) return;
        const storyObj = story as { content?: unknown };
        if (!storyObj.content) return;

        const updatedBlok = findBlokByUid(storyObj.content, uid!);
        if (updatedBlok && updatedBlok[field] !== undefined) {
          setValue(updatedBlok[field]);
        }
      });

      if (cancelled) {
        cleanup();
      } else {
        disposeRef.current = cleanup;
      }
    }

    void subscribe();

    return () => {
      cancelled = true;
      disposeRef.current?.();
      disposeRef.current = null;
    };
  }, [uid, field]);

  // Custom render function
  if (children) {
    const rendered = children(value);
    if (Tag) return <Tag className={className}>{rendered}</Tag>;
    return <>{rendered}</>;
  }

  // Default: render as string
  const text = String(value ?? '');
  if (Tag) return <Tag className={className}>{text}</Tag>;
  return <>{text}</>;
}
