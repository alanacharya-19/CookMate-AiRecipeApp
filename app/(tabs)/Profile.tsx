import Colors from "@/services/Colors";
import { UserContext } from "@/context/UserContext";
import { auth } from "@/services/firebase";
import React, { useContext, useMemo, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { deleteAccountAndData } from "@/services/accountService";
import { useRouter } from "expo-router";

export default function Profile() {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const initials = useMemo(() => {
    const raw = String(user?.name ?? "").trim();
    const safe = raw.includes("@") ? raw.split("@")[0] : raw;
    const first = safe.trim().split(/\s+/).filter(Boolean)[0] || "C";
    return first.charAt(0).toUpperCase();
  }, [user?.name]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.BG }} edges={["top"]}>
      <View style={{ padding: 18 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Profile</Text>

        <View
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: Colors.BORDER,
            backgroundColor: Colors.SURFACE,
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              backgroundColor: Colors.SECONDARY,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: Colors.BORDER,
            }}
          >
            <Text style={{ fontWeight: "900", fontSize: 22, color: Colors.PRIMARY }}>
              {initials}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "900", fontSize: 16 }}>
              {user?.name ?? "Chef"}
            </Text>
            <Text style={{ color: Colors.GRAY, marginTop: 4 }}>
              {user?.email ?? ""}
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: Colors.BORDER,
            backgroundColor: Colors.SURFACE,
          }}
        >
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/Home")}
            style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}
          >
            <Image source={require("./../../assets/images/i1.png")} style={{ width: 22, height: 22, opacity: 0.9 }} />
            <Text style={{ fontWeight: "900" }}>Create new recipes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/MyRecipes")}
            style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}
          >
            <Image source={require("./../../assets/images/i3.png")} style={{ width: 22, height: 22, opacity: 0.9 }} />
            <Text style={{ fontWeight: "900" }}>My recipes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/Cookbook")}
            style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}
          >
            <Image source={require("./../../assets/images/i2.png")} style={{ width: 22, height: 22, opacity: 0.9 }} />
            <Text style={{ fontWeight: "900" }}>Cookbook</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 16 }}>
          <TouchableOpacity
            onPress={async () => {
              await signOut(auth);
            }}
            style={{
              backgroundColor: Colors.DANGER,
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: "center",
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: "white", fontWeight: "900" }}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 12 }}>
          <TouchableOpacity
            onPress={() => {
              if (deleting) return;
              Alert.alert(
                "Delete account?",
                "This will permanently delete your account, your recipes, and your cookbook. This cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                      const firebaseUser = auth.currentUser;
                      if (!firebaseUser) return;
                      setDeleting(true);
                      try {
                        await deleteAccountAndData({ firebaseUser });
                      } catch (e: any) {
                        Alert.alert(
                          "Delete failed",
                          e?.message ??
                            "Please log in again and try deleting your account."
                        );
                      } finally {
                        setDeleting(false);
                      }
                    },
                  },
                ]
              );
            }}
            style={{
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: "center",
              borderWidth: 1,
              borderColor: Colors.BORDER,
              backgroundColor: Colors.SURFACE,
              opacity: deleting ? 0.6 : 1,
            }}
            activeOpacity={0.85}
            disabled={deleting}
          >
            <Text style={{ color: Colors.DANGER, fontWeight: "900" }}>
              {deleting ? "Deleting..." : "Delete account"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
