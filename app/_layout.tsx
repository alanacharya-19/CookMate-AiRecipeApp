import { UserContext } from "@/context/UserContext";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/services/firebase";
import { ensureUserProfile } from "@/services/usersService";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setAuthReady(true);
        return;
      }

      const profile = await ensureUserProfile({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        picture: firebaseUser.photoURL,
      });

      setUser(profile);
      setAuthReady(true);
    });

    return unsub;
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <UserContext.Provider value={{ user, setUser, authReady }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="Landing" />
            <Stack.Screen name="Auth" />
            <Stack.Screen name="FoodRecipes/[id]" />
            <Stack.Screen name="Category/[name]" />
            <Stack.Screen name="MyRecipes" />
          </Stack>
        </UserContext.Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
