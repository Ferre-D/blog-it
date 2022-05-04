/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useContext, useEffect, useState } from "react";
import { UserContext } from "../lib/context";
import { auth, firestore, googleAuthProvider } from "../lib/firebase";
import debounce from "lodash.debounce";
import { useRouter } from "next/router";

export default function EnterPage() {
  const { user, username } = useContext(UserContext);
  const router = useRouter();
  useEffect(() => {
    if (user && username) {
      router.push("/");
    }
  }, user);

  return (
    <main className="pagecontent">
      <div className="content-div">
        {user ? (
          !username ? (
            <UsernameForm />
          ) : (
            <></>
          )
        ) : (
          <div className="login-container d-flex">
            <div className="">
              <h2 className="login-title">Start your blogging journey today</h2>
              <h3>Sign in and get access to a bunch of cool features like:</h3>
              <div className="features-list">
                <p>
                  <span className="">✏️</span> Write your own blogs
                </p>
                <p>
                  <span className="">🚀</span> Upvote your favorite posts
                </p>
                <p>
                  💾 Save some awesome posts -{" "}
                  <small className="text-sm">coming soon</small>
                </p>
              </div>
              <SignInButton />
            </div>
            <div className="d-sm-none d-md-block">
              <img src="assets/login.svg" alt="" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
function SignInButton() {
  const SignInWithGoogle = async () => {
    await auth.signInWithPopup(googleAuthProvider);
  };
  return (
    <button className="btn-google" onClick={() => SignInWithGoogle()}>
      <img src="assets/google.png" /> Sign in with Google
    </button>
  );
}
function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid && username) {
    return <p className="text-success">{username} is available</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">{username} is taken!</p>;
  } else {
    return <p>Choose a username</p>;
  }
}

function UsernameForm() {
  const router = useRouter();
  const [formValue, setFormValue] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, username } = useContext(UserContext);

  const onSubmit = async (e) => {
    e.preventDefault();

    const userDoc = firestore.doc(`users/${user.uid}`);
    const usernameDoc = firestore.doc(`usernames/${formValue}`);

    const batch = firestore.batch();
    batch.set(userDoc, {
      username: formValue,
      photoURL: user.photoURL,
      displayName: user.displayName,
    });
    batch.set(usernameDoc, { uid: user.uid });

    await batch.commit();
    router.push("/");
  };
  const onChange = (e) => {
    const val = e.target.value.toLowerCase();

    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    if (val.length < 3) {
      setFormValue(val);
      setLoading(false);
      setIsValid(false);
    }
    if (re.test(val)) {
      setFormValue(val);
      setLoading(true);
      setIsValid(false);
    }
  };
  useEffect(() => {
    checkUsername(formValue);
  }, [formValue]);

  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        const ref = firestore.doc(`usernames/${username}`);

        const { exists } = await ref.get();
        console.log("firestore read executed");
        setIsValid(!exists);
        setLoading(false);
      }
    }, 500),
    []
  );

  return (
    !username && (
      <section>
        <h3>Choose a username</h3>
        <form onSubmit={onSubmit}>
          <input
            name="username"
            placeholder="username"
            value={formValue}
            onChange={onChange}
          />
          <UsernameMessage
            username={formValue}
            isValid={isValid}
            loading={loading}
          />
          <button type="submit" className="btn-green" disabled={!isValid}>
            That&apos;s me!
          </button>
          <h3>Debug State</h3>
          <div>
            Username: {formValue}
            <br />
            Loading: {loading.toString()}
            <br />
            Username Valid: {isValid.toString()}
          </div>
        </form>
      </section>
    )
  );
}
