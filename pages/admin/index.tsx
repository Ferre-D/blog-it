import styles from "../../styles/Admin.module.css";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import AuthCheck from "../../components/AuthCheck";
import PostFeed from "../../components/PostFeed";
import { UserContext } from "../../lib/context";
import { auth, firestore } from "../../lib/firebase";
import kebabCase from "lodash.kebabcase";
import { doc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

export default function AdminPostsPage({}) {
  return (
    <main className="pagecontent">
      <div className="content-div">
        <AuthCheck>
          <PostList />
          <CreateNewPost />
        </AuthCheck>
      </div>
    </main>
  );
}

function PostList() {
  const ref = firestore
    .collection("users")
    .doc(auth.currentUser.uid)
    .collection("posts");

  const query = ref.orderBy("createdAt");
  const [querySnapshot] = useCollection(query as any);

  const posts = querySnapshot?.docs.map((doc) => doc.data());

  return (
    <>
      <h1>Manage your posts</h1>

      <PostFeed posts={posts} admin />
    </>
  );
}

function CreateNewPost() {
  const router = useRouter();
  const { username } = useContext(UserContext);

  const [title, setTitle] = useState("");

  const slug = encodeURI(kebabCase(title));

  const isvalid = title.length > 3 && title.length < 100;
  const createPost = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser.uid;
    const ref = firestore
      .collection("users")
      .doc(uid)
      .collection("posts")
      .doc(slug);

    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: "# Welcome to your new blog post!",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      rocketCount: 0,
    };
    await ref.set(data);

    toast.success("Post created!");

    router.push(`/admin/${slug}`);
  };
  return (
    <form onSubmit={createPost}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className={styles.input}
      />
      <p>
        <strong>Slug: </strong> {slug}
      </p>
      <button type="submit" className="btn-green" disabled={!isvalid}>
        {"Let's start writing!"}
      </button>
    </form>
  );
}
