import { getCategoryImageByName } from "@/components/CategoryList";
import RecipeCard from "@/components/RecipeCard";
import { UserContext } from "@/context/UserContext";
import Colors from "@/services/Colors";
import { listCookbookRecipeIds } from "@/services/cookbookService";
import { fetchRecipesByIds } from "@/services/recipesService";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CookBook() {
  const router = useRouter();
  const { user } = useContext(UserContext);

  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const ids = await listCookbookRecipeIds({ uid: user.uid });
      const docs = await fetchRecipesByIds({ ids });
      setRecipes(docs);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load recipes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.BG }} edges={["top"]}>
      <FlatList
        contentContainerStyle={{ padding: 18, paddingBottom: 28 }}
        data={recipes}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 24, fontWeight: "900" }}>Cookbook</Text>
            <View
              style={{
                marginTop: 12,
                flexDirection: "row",
                gap: 10,
                alignItems: "center",
              }}
            >
              <Image
                source={require("./../../assets/images/i2.png")}
                style={{ width: 22, height: 22, opacity: 0.9 }}
              />
              <Text style={{ fontWeight: "900", color: Colors.PRIMARY, fontSize: 16 }}>
                Saved recipes
              </Text>
            </View>
            <Text style={{ color: Colors.GRAY, marginTop: 6 }}>
              Open any recipe and tap the bookmark icon to save it here.
            </Text>

            {loading ? <ActivityIndicator style={{ marginTop: 10 }} /> : null}
            {error ? (
              <Text style={{ color: Colors.DANGER, marginTop: 10 }}>{error}</Text>
            ) : null}
            {!loading && !error && recipes.length === 0 ? (
              <Text style={{ marginTop: 10 }}>
                No saved recipes yet. Open a recipe and tap “Save to Cookbook”.
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            imageSource={getCategoryImageByName(item.category)}
            onPress={() =>
              router.push({ pathname: "/FoodRecipes/[id]", params: { id: item.id } })
            }
          />
        )}
        onRefresh={refresh}
        refreshing={loading}
      />
    </SafeAreaView>
  );
}