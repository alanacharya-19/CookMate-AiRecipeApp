import type { GeneratedRecipe, IngredientItem } from "@/services/types";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/services/Colors";

export default function RecipeCard({
  recipe,
  onPress,
  imageSource,
}: {
  recipe: GeneratedRecipe;
  onPress?: () => void;
  imageSource?: any;
}) {
  const ingredientPreview = recipe.ingredients.slice(0, 4).map((it: any) =>
    typeof it === "string" ? it : (it as IngredientItem).name
  );
  const moreCount = Math.max(0, recipe.ingredients.length - ingredientPreview.length);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
    >
      <View style={styles.row}>
        {imageSource ? (
          <Image source={imageSource} style={styles.thumb} />
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>
          <Text style={styles.meta}>
            {recipe.category} • {recipe.vegType === "veg" ? "Veg" : "Non‑Veg"}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Ingredients</Text>
      <Text style={styles.body}>
        {ingredientPreview.join(", ")}
        {moreCount > 0 ? `, +${moreCount} more` : ""}
      </Text>

      <Text style={styles.sectionLabel}>Steps</Text>
      <Text style={styles.body}>
        {recipe.instructions.slice(0, 3).join(" | ")}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 18,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  thumb: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: "rgba(15, 23, 42, 0.05)",
  },
  title: {
    fontWeight: "900",
    fontSize: 16,
    color: Colors.BLACK,
  },
  meta: {
    marginTop: 4,
    color: Colors.GRAY,
    fontSize: 12,
  },
  sectionLabel: {
    marginTop: 10,
    fontWeight: "800",
    color: "rgba(15, 23, 42, 0.75)",
  },
  body: {
    marginTop: 6,
    color: "rgba(15, 23, 42, 0.85)",
    lineHeight: 18,
  },
});

