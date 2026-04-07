import Button from "@/components/Button";
import { UserContext } from "@/context/UserContext";
import Colors from "@/services/Colors";
import { auth } from "@/services/firebase";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const router = useRouter();
  const { user, authReady } = useContext(UserContext);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientIds = useMemo(() => {
    const defaultClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    return {
      clientId: defaultClientId,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    };
  }, []);

  const hasGoogleClientIds = Boolean(
    clientIds.clientId ||
      (clientIds.androidClientId && clientIds.iosClientId && clientIds.webClientId)
  );

  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: clientIds.clientId ?? undefined,
    androidClientId: (clientIds.androidClientId ?? clientIds.clientId) ?? "",
    iosClientId: (clientIds.iosClientId ?? clientIds.clientId) ?? "",
    webClientId: (clientIds.webClientId ?? clientIds.clientId) ?? "",
    scopes: ["profile", "email"],
    extraParams: {
      prompt: "select_account",
    },
  });

  useEffect(() => {
    if (!authReady) return;
    if (user) router.replace("/(tabs)/Home");
  }, [authReady, user, router]);

  useEffect(() => {
    if (response?.type !== "success") return;
    const params: any = (response as any)?.params;
    const idToken: string | undefined = params?.id_token ?? params?.idToken;

    if (!idToken) {
      setError("Google sign-in did not return an ID token.");
      return;
    }

    (async () => {
      try {
        setError(null);
        setLoading(true);
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        router.replace("/(tabs)/Home");
      } catch (e: any) {
        setError(e?.message ?? "Google sign-in failed.");
      } finally {
        setLoading(false);
      }
    })();
  }, [response, router]);

  async function handleEmailAuth() {
    setError(null);
    if (loading) return;
    if (mode === "register" && !fullName.trim()) return setError("Full name is required.");
    if (!email.trim()) return setError("Email is required.");
    if (!password) return setError("Password is required.");

    try {
      setLoading(true);
      if (mode === "register") {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: fullName.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      router.replace("/(tabs)/Home");
    } catch (e: any) {
      // Keep messages user-friendly but still helpful.
      const code = e?.code as string | undefined;
      if (code === "auth/invalid-credential") {
        setError("Wrong email or password.");
      } else if (code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in.");
      } else if (code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else {
        setError(e?.message ?? "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.WHITE }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1, padding: 20 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          onPress={() => router.replace("/Landing")}
          style={{ alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 6 }}
          activeOpacity={0.7}
        >
          <Text style={{ color: Colors.PRIMARY, fontWeight: "700" }}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require("./../assets/images/logo.png")} style={styles.logo} />
          <Text style={styles.title}>CookMate</Text>
          <Text style={styles.subtitle}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </Text>
        </View>

        <View style={styles.segmented}>
          <Text
            onPress={() => setMode("login")}
            style={[
              styles.segment,
              mode === "login" ? styles.segmentActive : undefined,
            ]}
          >
            Login
          </Text>
          <Text
            onPress={() => setMode("register")}
            style={[
              styles.segment,
              mode === "register" ? styles.segmentActive : undefined,
            ]}
          >
            Register
          </Text>
        </View>

        {mode === "register" ? (
          <TextInput
            placeholder="Full name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            style={styles.input}
          />
        ) : null}

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={[styles.input, styles.passwordInput]}
        />

        <Button
          label={mode === "login" ? "Login" : "Create account"}
          iconName="sparkles-fill"
          onPress={handleEmailAuth}
          disabled={loading}
        />

        <View style={{ height: 12 }} />

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={loading || !hasGoogleClientIds}
          onPress={async () => {
            if (!hasGoogleClientIds) {
              setError(
                "Missing Google client ID. Add EXPO_PUBLIC_GOOGLE_CLIENT_ID (or the platform-specific EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID / EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID / EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) to .env."
              );
              return;
            }
            try {
              setError(null);
              await promptAsync();
            } catch (e: any) {
              setError(e?.message ?? "Google sign-in failed.");
            }
          }}
          style={[
            styles.googleBtn,
            (loading || !hasGoogleClientIds) ? { opacity: 0.55 } : null,
          ]}
        >
          <FontAwesome name="google" size={20} color="#DB4437" />
          <Text style={styles.googleText}>
            {hasGoogleClientIds ? "Continue with Google" : "Configure Google in .env"}
          </Text>
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.footer}>
          By continuing, you agree to our Terms and Privacy Policy.
        </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 18,
  },
  title: {
    fontWeight: "bold",
    fontSize: 26,
    marginTop: 8,
  },
  subtitle: {
    color: Colors.GRAY,
    marginTop: 6,
    fontSize: 14,
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 14,
    padding: 6,
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 10,
    borderRadius: 12,
    color: "rgba(0,0,0,0.6)",
    fontWeight: "600",
  },
  segmentActive: {
    backgroundColor: Colors.SECONDARY,
    color: Colors.PRIMARY,
  },
  input: {
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    fontSize: 15,
  },
  passwordInput: {},
  errorText: {
    color: Colors.DANGER,
    marginTop: 12,
    textAlign: "center",
  },
  footer: {
    marginTop: 18,
    textAlign: "center",
    color: "rgba(0,0,0,0.5)",
    fontSize: 12,
  },
  googleBtn: {
    width: "100%",
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    backgroundColor: Colors.SURFACE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleText: {
    fontWeight: "900",
    color: Colors.BLACK,
    fontSize: 16,
  },
});

