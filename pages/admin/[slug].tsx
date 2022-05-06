import styles from "../../styles/Admin.module.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import AuthCheck from "../../components/AuthCheck";
import { auth, firestore, STATE_CHANGED, storage } from "../../lib/firebase";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import Link from "next/link";
import ImageUploader from "../../components/ImageUploader";
import Loader from "../../components/Loader";
import { url } from "inspector";

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
            <Link passHref href={`/${post.username}/${post.slug}`}>
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
  const [newThumbnail, setNewThumbnail] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const { errors, isValid, isDirty } = formState;
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  useEffect(() => {
    updatePostThumbnail();
  }, [downloadURL]);
  useEffect(() => {
    const filereader = new FileReader();
    if (!thumbnail) return;
    const url = filereader.readAsDataURL(thumbnail);
    filereader.onloadend = (r) => {
      setThumbnailPreview(filereader.result);
    };
  }, [thumbnail]);
  const updatePostThumbnail = async () => {
    if (downloadURL) {
      await postRef.update({
        thumbnail: downloadURL,
        updatedAt: serverTimestamp(),
      });
    }
  };
  const updatePost = async ({ content, published }) => {
    console.log(newThumbnail);

    if (thumbnail && newThumbnail) {
      const extension = thumbnail.type.split("/")[1];
      const ref = storage.ref(
        `uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`
      );
      setUploading(true);

      const task = ref.put(thumbnail);

      task.on(STATE_CHANGED, (snapshot) => {
        const pct = (
          (snapshot.bytesTransferred / snapshot.totalBytes) *
          100
        ).toFixed(0);

        setProgress(parseInt(pct));

        task
          .then((d) => ref.getDownloadURL())
          .catch((e) => console.log(e))
          .then((url) => {
            setDownloadURL(url);
            setUploading(false);
          })
          .catch((e) => console.log(e));
      });
    }
    await postRef.update({
      content,
      published,
      updatedAt: serverTimestamp(),
    });

    reset({ content, published });

    toast.success("Post updated!");
    setNewThumbnail(false);
    setDownloadURL(null);
  };
  const ThumbnailUploader = ({ watch }) => {
    const uploadFile = async (e) => {
      const file = Array.from(e.target.files)[0] as any;
      setThumbnail(file);
      setNewThumbnail(true);
    };

    return (
      <>
        <p className="mb-0">
          Choose a thumbnail <sup className="text-danger">*</sup>
        </p>

        <div className="box-thumbnail">
          <Loader show={uploading} />
          {uploading && <h3>{progress}%</h3>}
          {!uploading && (
            <>
              <label
                className="btn btn-primary-outline thumbnail"
                style={{
                  backgroundImage: thumbnailPreview
                    ? `url(${thumbnailPreview})`
                    : `url(${watch("thumbnail")})`,
                }}
              >
                📸
                <input
                  type="file"
                  onChange={uploadFile}
                  accept="image/x-png, image/gif, image/jpeg"
                />
              </label>
            </>
          )}
        </div>
      </>
    );
  };
  const checkValid = () => {
    if (watch("thumbnail")) return (!isDirty && !newThumbnail) || !isValid;

    return !isValid || (!isDirty && !newThumbnail);
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
          <ThumbnailUploader watch={watch} />
        </fieldset>
        <button type="submit" className="btn-green" disabled={checkValid()}>
          Save Changes
        </button>
      </div>
    </form>
  );
}
