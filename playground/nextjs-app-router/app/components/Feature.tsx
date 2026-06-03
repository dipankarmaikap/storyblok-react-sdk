import { type SbBlokData, storyblokEditable } from "@storyblok/react";

// Only runs on the server — client skips server-only env access
async function getSecretToken(): Promise<string | null> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return process.env.SECRET_TOKEN ?? null;
}

interface FeatureProps {
  blok: SbBlokData & { name: string; description: string };
}

export default async function Feature({ blok }: FeatureProps) {
  const secret = await getSecretToken();
  const masked = secret ? secret.slice(0, 3) + '\u2026' : null;

  return (
    <div className="feature" {...storyblokEditable(blok)}>
      <h2 className="text-2xl font-bold">
        {blok.name}
      </h2>
      <p>
        {blok.description}
      </p>
      <p className="text-xs text-gray-400 mt-2">
        {masked ? `\uD83D\uDD10 DB token: ${masked}` : ''}
      </p>
    </div>
  );
}
