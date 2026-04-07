import { firestore } from "@/services/firebase";
import type { UserProfile } from "@/services/types";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore/lite";

const usersCollection = "users";

export async function ensureUserProfile(params: {
  uid: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
}) {
  const { uid, name, email, picture } = params;
  const userRef = doc(firestore, usersCollection, uid);

  const snapshot = await getDoc(userRef);
  const emailPrefix = email ? email.split("@")[0] : undefined;
  const fallbackName =
    name || (emailPrefix ? emailPrefix.replace(/[._-]+/g, " ") : undefined);

  if (snapshot.exists()) {
    const existing = snapshot.data() as UserProfile;

    const shouldUpgradeName =
      Boolean(name?.trim()) &&
      (!existing?.name ||
        existing.name.includes("@") ||
        (emailPrefix && existing.name.trim().toLowerCase() === emailPrefix.toLowerCase()));

    const patch: Partial<UserProfile> = {};
    if (shouldUpgradeName) patch.name = String(name).trim();
    if (email && !existing?.email) patch.email = email;
    if (picture && !existing?.picture) patch.picture = picture;

    if (Object.keys(patch).length) {
      await setDoc(
        userRef,
        {
          ...patch,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return { ...existing, ...patch };
    }

    return existing;
  }

  const profile: UserProfile = { uid };
  if (fallbackName) profile.name = fallbackName;
  if (email) profile.email = email;
  if (picture) profile.picture = picture;

  await setDoc(
    userRef,
    {
      ...profile,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return profile;
}

