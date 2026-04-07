import { getCategoryImageByName } from "@/components/CategoryList";
import RecipeCard from "@/components/RecipeCard";
import { UserContext } from "@/context/UserContext";
import Colors from "@/services/Colors";
import { fetchRecipes } from "@/services/recipesService";
import type { GeneratedRecipe, VegType } from "@/services/types";
import { useRouter } from "expo-router";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyRecipesScreen() {
  const router = useRouter();
  const { user } = useContext(UserContext);

  const [vegMode, setVegMode] = useState(true);
  const vegType: VegType = useMemo(() => (vegMode ? "veg" : "non-veg"), [vegMode]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<(GeneratedRecipe & { id: string })[]>([]);

  const refresh = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecipes({ uid: user.uid, vegType });
      setRecipes(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load recipes.");
    } finally {
      setLoading(false);
    }
  }, [user?.uid, vegType]);

  useEffect(() => {
    refresh();

  }, [refresh]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.BG }} edges={["top"]}>
      <FlatList
        contentContainerStyle={{ padding: 18, paddingBottom: 28 }}
        data={recipes}
        keyExtractor={(item) => item.id}
        onRefresh={refresh}
        refreshing={loading}
        ListHeaderComponent={
          <View style={{ marginBottom: 10 }}>
            <Text onPress={() => router.back()} style={{ color: Colors.PRIMARY, fontWeight: "800" }}>
              ← Back
            </Text>
            <View style={{ marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 24, fontWeight: "900" }}>My Recipes</Text>
              <Text
                onPress={() => setVegMode((v) => !v)}
                style={{
                  backgroundColor: vegMode ? Colors.PRIMARY : Colors.DANGER,
                  color: "white",
                  fontWeight: "900",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                }}
              >
                {vegMode ? "Veg" : "Non‑Veg"}
              </Text>
            </View>
            {loading ? <ActivityIndicator style={{ marginTop: 10 }} /> : null}
            {error ? <Text style={{ color: Colors.DANGER, marginTop: 10 }}>{error}</Text> : null}
            {!loading && !error && recipes.length === 0 ? (
              <Text style={{ marginTop: 10 }}>No recipes yet. Create one from Home.</Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            imageSource={getCategoryImageByName(item.category)}
            onPress={() => router.push({ pathname: "/FoodRecipes/[id]", params: { id: item.id } })}
          />
        )}
      />
    </SafeAreaView>
  );
}

