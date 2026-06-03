import {
  storyblokEditable,
  type Story,
  type SbBlokData,
} from "@storyblok/react";
import { client } from "../lib/storyblok";

type FeaturedArticlesBlok = SbBlokData & {
  title?: string;
  articles?: string[] | Story[];
};
function isResolvedStories(
  articles: string[] | Story[]
): articles is Story[] {
  return articles.length > 0 && typeof articles[0] !== "string";
}
export default async function FeaturedArticles({
  blok,
}: {
  blok: FeaturedArticlesBlok;
}) {
  const articles = blok.articles ?? [];
  let resolvedArticles: Story[] = [];

  if (articles.length > 0) {
    if (typeof articles[0] === "string") {
      const { data } = await client.stories.list({
        query: {
          by_uuids: articles.join(","),
          version: "draft",
        },
      });
      resolvedArticles = data?.stories ?? [];
      console.log("Fetching articles by UUIDs: title:", blok.title, articles);
    } else if (isResolvedStories(articles)) {
      resolvedArticles = articles;
    }
  }

  return (
    <section {...storyblokEditable(blok)}>
      {blok.title && (
        <h2 className="text-2xl font-bold">
          {blok.title}
        </h2>
      )}
      {resolvedArticles.length > 0 && (
        <ul>
          {resolvedArticles.map((article) => (
            <li key={article.uuid}>
              <h3 className="text-xl font-semibold">{article.name}</h3>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
