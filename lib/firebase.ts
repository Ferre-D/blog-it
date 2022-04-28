import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCGjAvibjuv0V7_3wkFbneykD60kv4uh_M",
  authDomain: "blog-it-f4dd7.firebaseapp.com",
  projectId: "blog-it-f4dd7",
  storageBucket: "blog-it-f4dd7.appspot.com",
  messagingSenderId: "666134329622",
  appId: "1:666134329622:web:9f82c807aeaeb69d2fb837",
  measurementId: "G-GH6KWE53Q3",
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

export const firestore = firebase.firestore();
export const storage = firebase.storage();

export const fromMillis = firebase.firestore.Timestamp.fromMillis;
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

export const STATE_CHANGED = firebase.storage.TaskEvent.STATE_CHANGED;
/**
 * Gets a users/{uid} docuement with username
 * @param {string} username
 */
export async function getUserWithUsername(username) {
  const usersRef = firestore.collection("users");
  const query = usersRef.where("username", "==", username).limit(1);
  const userDoc = (await query.get()).docs[0];
  return userDoc;
}

/**
 * converts a firestore document to JSON
 * @param {DocuementSnapshot} doc
 */
export function postToJSON(doc) {
  const data = doc.data();
  return {
    ...data,
    createdAt: data.createdAt.toMillis(),
    updatedAt: data.updatedAt.toMillis(),
  };
}
