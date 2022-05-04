import Link from "next/link";
import ReactMarkDown from "react-markdown";
import { fromMillis } from "../lib/firebase";

export default function PostContent({ post }) {
  const createdAt =
    typeof post?.createdAt === "number"
      ? new Date(post.createdAt)
      : post.createdAt.toDate();
  return (
    <div className="post-content-card">
      <h1>{post?.title}</h1>
      <span className="text-sm">
        Written by{" "}
        <Link href={`/${post.username}`}>
          <a className="text-info">@{post?.username}</a>
        </Link>{" "}
        on {createdAt.toISOString()}
      </span>
      <ReactMarkDown>{post?.content}</ReactMarkDown>
    </div>
  );
}
