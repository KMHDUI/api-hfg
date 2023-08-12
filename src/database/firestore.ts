import admin from "firebase-admin";
import secretCredential from "../../firebase.json";

export let db: admin.firestore.Firestore;

export const initializeFirestore = (): void => {
  const credential = secretCredential as any;

  admin.initializeApp({ credential: admin.credential.cert(credential) });
  db = admin.firestore();
};
