import Loader from "../components/Loader";
import { firestore, fromMillis, postToJSON } from "../lib/firebase";
import { useState } from "react";
import PostFeed from "../components/PostFeed";
import Image from "next/image";

//max posts to query per page;
const LIMIT = 1;

export async function getServerSideProps(context) {
  const postsQuery = firestore
    .collectionGroup("posts")
    .where("published", "==", true)
    .orderBy("createdAt", "desc")
    .limit(LIMIT);

  const posts = (await postsQuery.get()).docs.map(postToJSON);

  return {
    props: { posts },
  };
}

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);

  const [postEnd, setPostEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const cursor =
      typeof last.createdAt === "number"
        ? fromMillis(last.createdAt)
        : last.createdAt;

    const query = firestore
      .collectionGroup("posts")
      .where("published", "==", true)
      .orderBy("createdAt", "desc")
      .startAfter(cursor)
      .limit(LIMIT);

    const newPosts = (await query.get()).docs.map((doc) => doc.data());

    setPosts(posts.concat(newPosts));
    setLoading(false);

    if (newPosts.length < LIMIT) {
      setPostEnd(true);
    }
  };

  return (
    <main className="pagecontent">
      <Banner />
      <PostFeed posts={posts} />

      {!loading && !postEnd && (
        <button className="btn-primary-outline" onClick={getMorePosts}>
          Load More
        </button>
      )}

      <Loader show={loading} />

      {postEnd && <b>All done!</b>}
    </main>
  );
}
function Banner() {
  return (
    <div className="d-flex banner">
      <div className="banner-content">
        <h3>{"A blog for a developer from a developer!"}</h3>
      </div>
      <div className="banner-image">
        <div>
          <img className="image" src="/assets/banner.svg" alt="banner" />
        </div>
      </div>
    </div>
  );
}
