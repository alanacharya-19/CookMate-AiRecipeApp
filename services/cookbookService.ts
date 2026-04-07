import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore/lite";
import { firestore } from "@/services/firebase";

const cookbookCollection = "cookbook";

export async function addToCookbook(params: { uid: string; recipeId: string }) {
  const { uid, recipeId } = params;
  const q = query(
    collection(firestore, cookbookCollection),
    where("uid", "==", uid),
    where("recipeId", "==", recipeId)
  );
  const existing = await getDocs(q);
  if (!existing.empty) return existing.docs[0].id;

  const ref = await addDoc(collection(firestore, cookbookCollection), {
    uid,
    recipeId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function removeFromCookbook(params: { uid: string; recipeId: string }) {
  const { uid, recipeId } = params;
  const q = query(
    collection(firestore, cookbookCollection),
    where("uid", "==", uid),
    where("recipeId", "==", recipeId)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(doc(firestore, cookbookCollection, d.id))));
}

export async function listCookbookRecipeIds(params: { uid: string }) {
  const q = query(collection(firestore, cookbookCollection), where("uid", "==", params.uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => String((d.data() as any)?.recipeId)).filter(Boolean);
}

