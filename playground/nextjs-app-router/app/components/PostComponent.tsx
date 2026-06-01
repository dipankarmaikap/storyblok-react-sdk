import { storyblokEditable, type SbBlokData } from "@storyblok/react";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export default async function PostComponent({ blok }: { blok: SbBlokData }) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${blok.postId || 1}`,
    {
      cache: "no-store",
    }
  );

  const post: Post = await response.json();

  return (
    <article {...storyblokEditable(blok)}>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      {blok.customField && <p>{String(blok.customField)}</p>}
    </article>
  );
}
