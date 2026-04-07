import Colors from "@/services/Colors";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type RecipeSuggestion = {
  title: string;
  emoji: string;
  description: string;
};

export default function SuggestionsSheet({
  visible,
  suggestions,
  onClose,
  onSelect,
  loading,
}: {
  visible: boolean;
  suggestions: RecipeSuggestion[];
  onClose: () => void;
  onSelect: (s: RecipeSuggestion) => void;
  loading?: boolean;
}) {
  const translateY = useRef(new Animated.Value(500)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const anim = useMemo(
    () =>
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: visible ? 1 : 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: visible ? 0 : 500,
          useNativeDriver: true,
          damping: 18,
          stiffness: 160,
          mass: 0.6,
        }),
      ]),
    [opacity, translateY, visible]
  );

  useEffect(() => {
    anim.start();
  }, [anim]);

  if (!visible) return null;

  return (
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY }], opacity },
        ]}
      >
        <SafeAreaView edges={["bottom"]}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>Pick a recipe</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {loading
              ? "Generating suggestions…"
              : "Tap one to generate the full recipe."}
          </Text>

          {suggestions.map((s, idx) => (
            <TouchableOpacity
              key={`${s.title}:${idx}`}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => onSelect(s)}
              disabled={loading}
            >
              <Text style={styles.cardTitle}>
                {idx + 1}. <Text style={styles.bold}>{s.title}</Text>{" "}
                {s.emoji}
              </Text>
              <Text style={styles.cardBody}>{s.description}</Text>
            </TouchableOpacity>
          ))}
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: Colors.SURFACE,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignSelf: "center",
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
  },
  close: {
    color: Colors.PRIMARY,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 6,
    color: Colors.GRAY,
  },
  card: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 18,
    padding: 12,
    backgroundColor: Colors.BG,
  },
  cardTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: Colors.BLACK,
  },
  bold: {
    fontWeight: "900",
  },
  cardBody: {
    marginTop: 6,
    color: "rgba(15, 23, 42, 0.78)",
    lineHeight: 18,
  },
});

