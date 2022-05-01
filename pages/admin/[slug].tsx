import styles from "../../styles/Admin.module.css";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import AuthCheck from "../../components/AuthCheck";
import { auth, firestore } from "../../lib/firebase";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import Link from "next/link";
import ImageUploader from "../../components/ImageUploader";

export default function AdminPostEdit({}) {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
}
function PostManager() {
  const [preview, setPreview] = useState(false);

  const router = useRouter();
  const { slug } = router.query;

  const postRef = firestore
    .collection("users")
    .doc(auth.currentUser.uid)
    .collection("posts")
    .doc(slug as string);
  const [post] = useDocumentData(postRef as any);

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1 className={styles.contenttitle}>{post.title}</h1>
            <p className={styles.contentid}>ID: {post.slug}</p>

            <PostForm
              postRef={postRef}
              defaultValues={post}
              preview={preview}
            />
          </section>
          <aside>
            <button onClick={() => setPreview(!preview)}>
              {preview ? "Edit" : "Preview"}
            </button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live view</button>
            </Link>
          </aside>
        </>
      )}
    </main>
  );
}

function PostForm({ defaultValues, postRef, preview }) {
  const { register, handleSubmit, reset, watch, formState } = useForm({
    defaultValues,
    mode: "onChange",
  });
  const { errors, isValid, isDirty } = formState;

  const updatePost = async ({ content, published }) => {
    await postRef.update({
      content,
      published,
      updatedAt: serverTimestamp(),
    });

    reset({ content, published });

    toast.success("Post updated!");
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card p-1">
          <ReactMarkdown>{watch("content")}</ReactMarkdown>
        </div>
      )}
      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />
        <textarea
          name="content"
          {...register("content", {
            maxLength: {
              value: 20000,
              message: "Content is too long (plus 20k chars)!",
            } as any,
            minLength: {
              value: 10,
              message: "Content is too short (sub 10 chars)!",
            } as any,
            required: {
              value: true,
              message: "Content is required!",
            } as any,
          })}
        ></textarea>
        {errors.content && (
          <p className="text-danger">{errors.content.message}</p>
        )}
        <fieldset>
          <input
            type="checkbox"
            name="published"
            id="published"
            className={styles.checkbox}
            {...register("published")}
          />
          <label htmlFor="published">published</label>
        </fieldset>
        <button
          type="submit"
          className="btn-green"
          disabled={!isDirty || !isValid}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
