import { increment } from "firebase/firestore";
import { useDocument, useDocumentData } from "react-firebase-hooks/firestore";
import { auth, firestore } from "../lib/firebase";

export default function RocketButton({ postRef }) {
  const rocketRef = postRef.collection("rockets").doc(auth.currentUser.uid);

  const [rocketDoc] = useDocument(rocketRef);

  const addRocket = async () => {
    const uid = auth.currentUser.uid;
    const batch = firestore.batch();

    batch.update(postRef, { rocketCount: increment(1) });
    batch.set(rocketRef, { uid });

    await batch.commit();
  };

  const removeRocket = async () => {
    const batch = firestore.batch();
    batch.update(postRef, { rocketCount: increment(-1) });
    batch.delete(rocketRef);

    await batch.commit();
  };

  return rocketDoc?.exists() ? (
    <button onClick={removeRocket}>🚀 Unrocket</button>
  ) : (
    <button onClick={addRocket}>🚀 Rocket</button>
  );
}
