import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore/lite";
import { deleteUser, type User } from "firebase/auth";
import { firestore } from "@/services/firebase";

async function deleteWhere(params: {
  collectionName: string;
  uid: string;
  uidField?: string;
}) {
  const { collectionName, uid, uidField = "uid" } = params;
  const q = query(collection(firestore, collectionName), where(uidField, "==", uid));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(doc(firestore, collectionName, d.id))));
}

export async function deleteAccountAndData(params: {
  firebaseUser: User;
}) {
  const { firebaseUser } = params;
  const uid = firebaseUser.uid;

  // Best-effort cleanup. If any step fails, surface the error so UI can prompt re-login.
  await deleteWhere({ collectionName: "cookbook", uid });
  await deleteWhere({ collectionName: "recipes", uid });
  await deleteDoc(doc(firestore, "users", uid)).catch(() => null);

  await deleteUser(firebaseUser);
}

