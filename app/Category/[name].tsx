import Colors from "@/services/Colors";
import RecipeCard from "@/components/RecipeCard";
import { UserContext } from "@/context/UserContext";
import { fetchRecipes, saveGeneratedRecipes } from "@/services/recipesService";
import { generateRecipesFromAI } from "@/services/aiService";
import type { GeneratedRecipe, VegType } from "@/services/types";
import { getCategoryImageByName } from "@/components/CategoryList";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoryScreen() {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const params = useLocalSearchParams<{ name?: string }>();

  const categoryName = params?.name ? String(params.name) : "";

  const [vegMode, setVegMode] = useState(true);
  const vegType: VegType = useMemo(() => (vegMode ? "veg" : "non-veg"), [vegMode]);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<(GeneratedRecipe & { id: string })[]>([]);

  async function loadRecipes(): Promise<(GeneratedRecipe & { id: string })[]> {
    if (!user?.uid || !categoryName) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecipes({
        uid: user.uid,
        vegType,
        category: categoryName,
      });
      setRecipes(data);
      return data;
    } catch (e: any) {
      setError(e?.message ?? "Failed to load recipes.");
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function generateForCategory() {
    if (!user?.uid || !categoryName || generating) return;
    setGenerating(true);
    setError(null);
    try {
      const generated = await generateRecipesFromAI({
        prompt: `Generate popular ${categoryName} recipes.`,
        vegType,
        category: categoryName,
        count: 10,
      });

      // Force category to match the selected category so filtering is consistent.
      const normalized = generated.map((r) => ({ ...r, category: categoryName }));

      await saveGeneratedRecipes({
        uid: user.uid,
        recipes: normalized,
      });

      await loadRecipes();
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate recipes.");
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    (async () => {
      if (!user?.uid || !categoryName) return;
      const existing = await loadRecipes();
      if (existing.length === 0) {
        await generateForCategory();
      }
    })();
    // We intentionally do not include loadRecipes/generateForCategory in deps
    // to avoid re-generating repeatedly; this effect is keyed by user/category/vegType.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, vegType, categoryName]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.WHITE }} edges={["top"]}>
      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(0,0,0,0.06)",
          backgroundColor: Colors.WHITE,
        }}
      >
        <Text onPress={() => router.back()} style={{ color: Colors.PRIMARY, fontWeight: "600" }}>
          ← Back
        </Text>
        <View style={{ marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>{categoryName}</Text>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => setVegMode((v) => !v)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
                backgroundColor: vegMode ? Colors.PRIMARY : Colors.DANGER,
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>
                {vegMode ? "Veg" : "Non‑Veg"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={generateForCategory}
              disabled={generating}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
                backgroundColor: "rgba(0,0,0,0.08)",
                opacity: generating ? 0.6 : 1,
              }}
            >
              <Text style={{ fontWeight: "700" }}>
                {generating ? "Generating..." : "Generate"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 18 }}
        data={recipes}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={{ marginTop: 10 }}>
            {loading ? <ActivityIndicator /> : null}
            {generating ? <ActivityIndicator /> : null}
                {error ? <Text style={{ color: Colors.DANGER }}>{error}</Text> : null}
            {!loading && !generating && !error && recipes.length === 0 ? (
              <Text>No recipes yet. Tap Generate.</Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            imageSource={getCategoryImageByName(item.category)}
            onPress={() =>
              router.push({
                pathname: "/FoodRecipes/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

