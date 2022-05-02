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
        <div className="card-content">
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
          <footer>
            <span>
              {wordCount} words • {minutesToRead} min read
            </span>
            <span className="push-left">
              🚀 {post.rocketCount || 0} Rockets
            </span>
          </footer>
          {/* If admin view, show extra controls for user */}
          {admin && (
            <>
              <Link href={`/admin/${post.slug}`}>
                <h3>
                  <button className="btn-blue">Edit</button>
                </h3>
              </Link>

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
