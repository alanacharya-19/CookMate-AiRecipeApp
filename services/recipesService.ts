import {
  addDoc,
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore/lite";
import type { GeneratedRecipe, VegType } from "@/services/types";
import { firestore } from "@/services/firebase";

const recipesCollection = "recipes";

export async function saveGeneratedRecipes(params: {
  uid: string;
  email?: string;
  recipes: GeneratedRecipe[];
}) {
  const { uid, recipes } = params;
  if (!recipes.length) return [];

  const tasks = recipes.map((r) =>
    addDoc(collection(firestore, recipesCollection), {
      ...r,
      uid,
      createdAt: serverTimestamp(),
    })
  );

  const refs = await Promise.all(tasks);
  return refs.map((r) => r.id);
}

export async function fetchRecipes(params: {
  uid: string;
  vegType: VegType;
  category?: string;
}) {
  const { uid, vegType, category } = params;

  const base = query(
    collection(firestore, recipesCollection),
    where("uid", "==", uid),
    where("vegType", "==", vegType)
  );

  const q = category ? query(base, where("category", "==", category)) : base;

  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as GeneratedRecipe & { uid: string };
    return { id: d.id, ...data };
  });
}

export async function fetchRecipeById(params: { id: string }) {
  const snap = await getDoc(doc(firestore, recipesCollection, params.id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) } as GeneratedRecipe & {
    id: string;
    uid: string;
    createdAt?: any;
  };
}

export async function fetchRecipesByIds(params: { ids: string[] }) {
  const unique = Array.from(new Set(params.ids.map(String))).filter(Boolean);
  if (unique.length === 0) return [];
  const docs = await Promise.all(unique.map((id) => fetchRecipeById({ id })));
  return docs.filter(Boolean) as Array<GeneratedRecipe & { id: string; uid: string }>;
}

