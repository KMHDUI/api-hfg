import admin from "firebase-admin";
import dotenv from "dotenv";

export let db: admin.firestore.Firestore;
dotenv.config();
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG as string);

export const initializeFirestore = (): void => {
  admin.initializeApp({ credential: admin.credential.cert(firebaseConfig) });
  db = admin.firestore();
};
