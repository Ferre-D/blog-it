import Link from "next/link";

//props: posts, admin nullable
export default function PostFeed({ posts, admin = false }) {
  return posts
    ? posts.map((post) => (
        <PostItem post={post} key={post.slug} admin={admin} />
      ))
    : null;
  function PostItem({ post, admin = false }) {
    const wordCount = post?.content.trim().split(/\s+/g).length;
    const minutesToRead = (wordCount / 100 + 1).toFixed(0);
    return (
      <div className="card d-flex">
        <div className="card-content pos-relative">
          <Link href={`/${post.username}`}>
            <a>
              <strong>
                By <span className="post_creator">@{post.username}</span>
              </strong>
            </a>
          </Link>
          <Link href={`/${post.username}/${post.slug}`}>
            <h2>
              <a>{post.title}</a>
            </h2>
          </Link>
          <footer className="pos-relative">
            <span>
              {wordCount} words • {minutesToRead} min read
            </span>
            <span className="pos-bottom-right">
              🚀 {post.rocketCount || 0} Rockets
            </span>
          </footer>
          {/* If admin view, show extra controls for user */}
          {admin && (
            <>
              <div className="top-right d-flex controls">
              <Link href={`/admin/${post.slug}`}>
                <p
                  className="edit">Edit
                </p>
              </Link>

              </div>
              {post.published ? (
                <p className="text-success">Live</p>
              ) : (
                <p className="text-danger">Unpublished</p>
              )}
              </>
          )}
        </div>
        <div
          className="card-thumbnail"
          style={{
            backgroundImage: `url(${post.thumbnail})`,
          }}
        ></div>
      </div>
    );
  }
}
