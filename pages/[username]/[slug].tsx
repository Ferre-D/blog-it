import styles from "../../styles/Post.module.css";
import { firestore, getUserWithUsername, postToJSON } from "../../lib/firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { DocumentData, DocumentReference } from "firebase/firestore";
import PostContent from "../../components/PostContent";
import AuthCheck from "../../components/AuthCheck";
import RocketButton from "../../components/RocketButton";
import Link from "next/link";
import Metatags from "../../components/Metatags";

export async function getStaticProps({ params }) {
  const { username, slug } = params;
  const userDoc = await getUserWithUsername(username);
  let post;
  let path;

  if (userDoc) {
    const postRef = userDoc.ref.collection("posts").doc(slug);

    post = postToJSON(await postRef.get());

    path = postRef.path;
  }

  return {
    props: { post, path },
    revalidate: 5000,
  };
}

export async function getStaticPaths() {
  // Improve my using Admin SDK to select empty docs
  const snapshot = await firestore.collectionGroup("posts").get();

  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data();
    return {
      params: { username, slug },
    };
  });

  return {
    // must be in this format:
    // paths: [
    //   { params: { username, slug }}
    // ],
    paths,
    fallback: "blocking",
  };
}

export default function PostPage(props) {
  const postRef = firestore.doc(props.path);
  const [realTimePost] = useDocumentData(postRef as any);

  const post = realTimePost || props.post;

  return (
    <main className={styles.container}>
      <Metatags title={"Post | " + post.title} />
      <section>
        <PostContent post={post} />
      </section>

      <aside className="card p-1">
        <p>
          <strong>{post.rocketCount || 0} 🚀</strong>
        </p>
        <AuthCheck
          fallback={
            <Link passHref href={"/enter"}>
              <button>Sign up</button>
            </Link>
          }
        >
          <RocketButton postRef={postRef} />
          <p>
            Let the creator know that you liked his post by clicking the 🚀
            button.
          </p>
        </AuthCheck>
      </aside>
    </main>
  );
}
