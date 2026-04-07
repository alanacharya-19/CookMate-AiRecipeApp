import CategoryList, {
  getCategoryImageByName,
} from "@/components/CategoryList";
import { UserContext } from "@/context/UserContext";
import Colors from "@/services/Colors";
import { fetchRecipes } from "@/services/recipesService";
import type { GeneratedRecipe, VegType } from "@/services/types";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Explore() {
  const router = useRouter();
  const { user } = useContext(UserContext);

  const [vegMode, setVegMode] = useState(true);
  const vegType: VegType = useMemo(
    () => (vegMode ? "veg" : "non-veg"),
    [vegMode],
  );

  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<(GeneratedRecipe & { id: string })[]>(
    [],
  );

  useEffect(() => {
    (async () => {
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
    })();
  }, [user?.uid, vegType]);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter((r) => {
      const title = String(r.title ?? "").toLowerCase();
      const cat = String(r.category ?? "").toLowerCase();
      return title.includes(q) || cat.includes(q);
    });
  }, [recipes, queryText]);

  const isSearch = queryText.trim().length > 0;

  const listData = useMemo(() => {
    if (isSearch) return filtered;
    const arr = [...filtered];
    arr.sort((a: any, b: any) => {
      const ta = a?.createdAt?.seconds ?? a?.createdAt?._seconds ?? 0;
      const tb = b?.createdAt?.seconds ?? b?.createdAt?._seconds ?? 0;
      return tb - ta;
    });
    return arr.slice(0, 12);
  }, [filtered, isSearch]);

  const getShortDescription = (r: any) => {
    const tip =
      Array.isArray(r?.tips) && r.tips.length ? String(r.tips[0]) : "";
    if (tip) return tip;
    const firstStep =
      Array.isArray(r?.instructions) && r.instructions.length
        ? String(r.instructions[0])
        : "";
    if (firstStep)
      return firstStep.length > 90 ? `${firstStep.slice(0, 90)}…` : firstStep;
    return "Fresh, tasty, and easy to cook. Tap to see the full recipe.";
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.BG }}
      edges={["top"]}
    >
      <FlatList
        contentContainerStyle={{ padding: 18, paddingBottom: 28 }}
        data={listData}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: "bold" }}>Explore</Text>
              <Text
                onPress={() => setVegMode((v) => !v)}
                style={{
                  backgroundColor: vegMode ? Colors.PRIMARY : Colors.DANGER,
                  color: "white",
                  fontWeight: "800",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                }}
              >
                {vegMode ? "Veg" : "Non‑Veg"}
              </Text>
            </View>

            <TextInput
              value={queryText}
              onChangeText={setQueryText}
              placeholder="Search recipes or categories..."
              placeholderTextColor={Colors.GRAY}
              style={{
                marginTop: 12,
                borderWidth: 1,
                borderColor: Colors.BORDER,
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: Colors.SURFACE,
              }}
            />

            <CategoryList
              onPressCategory={(cat) =>
                router.push({
                  pathname: "/Category/[name]",
                  params: { name: cat.name },
                })
              }
            />

            {loading ? <ActivityIndicator style={{ marginTop: 10 }} /> : null}
            {error ? (
              <Text style={{ color: Colors.DANGER, marginTop: 10 }}>
                {error}
              </Text>
            ) : null}

            {!loading && !error ? (
              <View style={{ marginTop: 10 }}>
                <Text
                  style={{
                    fontWeight: "900",
                    fontSize: 18,
                    color: Colors.BLACK,
                  }}
                >
                  New
                </Text>
                <Text style={{ marginTop: 4, color: Colors.GRAY }}>
                  Your latest recipes — tap to cook.
                </Text>
                {!isSearch && listData.length === 0 ? (
                  <View
                    style={{
                      marginTop: 10,
                      borderWidth: 1,
                      borderColor: Colors.BORDER,
                      backgroundColor: Colors.SURFACE,
                      borderRadius: 16,
                      padding: 12,
                    }}
                  >
                    <Text style={{ fontWeight: "900", color: Colors.BLACK }}>
                      No recipes yet
                    </Text>
                    <Text style={{ marginTop: 6, color: Colors.GRAY, lineHeight: 18 }}>
                      Generate recipes in Home or open a category to create your first recipes.
                    </Text>
                    <Text
                      onPress={() => router.push("/(tabs)/Home")}
                      style={{ marginTop: 10, fontWeight: "900", color: Colors.PRIMARY }}
                    >
                      Go to Home →
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const imageSource = getCategoryImageByName(item.category);
          const titleText = String(item.title ?? "");
          const descText = getShortDescription(item);
          return (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                router.push({
                  pathname: "/FoodRecipes/[id]",
                  params: { id: item.id },
                });
              }}
              style={{
                marginTop: 12,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: Colors.BORDER,
                backgroundColor: Colors.SURFACE,
                overflow: "hidden",
              }}
            >
              <View style={{ flexDirection: "row", minHeight: 102 }}>
                <Image
                  source={imageSource}
                  style={{
                    width: 98,
                    height: "100%",
                    backgroundColor: Colors.SECONDARY,
                  }}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, padding: 12 }}>
                  <Text
                    style={{
                      fontWeight: "900",
                      color: Colors.BLACK,
                      fontSize: 15,
                    }}
                    numberOfLines={2}
                  >
                    {titleText}
                  </Text>
                  <Text
                    style={{ marginTop: 4, color: Colors.GRAY, fontSize: 12 }}
                  >
                    {item.category} •{" "}
                    {item.vegType === "veg" ? "Veg" : "Non‑Veg"}
                  </Text>
                  <Text
                    style={{
                      marginTop: 8,
                      color: "rgba(16,24,40,0.78)",
                      lineHeight: 18,
                    }}
                    numberOfLines={2}
                  >
                    {descText}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
