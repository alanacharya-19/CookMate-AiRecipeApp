import { UserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, authReady } = useContext(UserContext);
  const router = useRouter();
  const didNavigate = useRef(false);

  useEffect(() => {
    if (!authReady || didNavigate.current) return;
    didNavigate.current = true;
    router.replace(user ? "/(tabs)/Home" : "/Landing");
  }, [authReady, user, router]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  );
}
