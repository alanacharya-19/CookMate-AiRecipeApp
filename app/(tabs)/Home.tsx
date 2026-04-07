import CategoryList, {
  getCategoryImageByName,
} from "@/components/CategoryList";
import CreateRecipe from "@/components/CreateRecipe";
import RecipeCard from "@/components/RecipeCard";
import IntroHeader from "@/components/IntroHeader";
import Colors from "@/services/Colors";
import { UserContext } from "@/context/UserContext";
import { generateRecipeSuggestionsFromAI, generateRecipesFromAI } from "@/services/aiService";
import { fetchRecipes, saveGeneratedRecipes } from "@/services/recipesService";
import { type GeneratedRecipe, type VegType } from "@/services/types";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "@/components/Toast";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import SuggestionsSheet, { type RecipeSuggestion } from "@/components/SuggestionsSheet";

export default function Home() {
  const { user } = useContext(UserContext);
  const router = useRouter();

  const [vegMode, setVegMode] = useState(true);
  const vegType: VegType = useMemo(() => (vegMode ? "veg" : "non-veg"), [vegMode]);

  const [recipes, setRecipes] = useState<(GeneratedRecipe & { id: string })[]>(
    []
  );
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [recipesError, setRecipesError] = useState<string | null>(null);
  const [recentVisitedIds, setRecentVisitedIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string>("");
  const [toastVisible, setToastVisible] = useState(false);
  const [popularIds, setPopularIds] = useState<string[]>([]);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [lastPrompt, setLastPrompt] = useState("");

  const recentStorageKey = useMemo(
    () => (user?.uid ? `recentVisitedRecipes:${user.uid}` : "recentVisitedRecipes:anon"),
    [user?.uid]
  );

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(recentStorageKey);
        const parsed = raw ? JSON.parse(raw) : [];
        setRecentVisitedIds(Array.isArray(parsed) ? parsed.map(String) : []);
      } catch {
        setRecentVisitedIds([]);
      }
    })();
  }, [recentStorageKey]);

  async function refreshRecipes() {
    if (!user?.uid) return;
    setLoadingRecipes(true);
    setRecipesError(null);
    try {
      const data = await fetchRecipes({
        uid: user.uid,
        vegType,
      });
      setRecipes(data);
    } catch (e: any) {
      setRecipesError(e?.message ?? "Failed to load recipes.");
    } finally {
      setLoadingRecipes(false);
    }
  }

  useEffect(() => {
    refreshRecipes(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, vegType]);

  useEffect(() => {
    // Randomize popular recipes whenever the filtered list changes.
    const ids = recipes.map((r) => r.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    setPopularIds(ids.slice(0, 5));
  }, [recipes]);

  function showToast(message: string) {
    setToastMsg(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.BG }} edges={["top"]}>
      <View
        style={{
          backgroundColor: Colors.SURFACE,
          paddingHorizontal: 25,
          paddingTop: 18,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: Colors.BORDER,
        }}
      >
        <IntroHeader vegMode={vegMode} onVegModeChange={setVegMode} />
      </View>
      <FlatList
        style={{ backgroundColor: Colors.BG }}
        contentContainerStyle={{ paddingHorizontal: 25, paddingBottom: 25 }}
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            imageSource={getCategoryImageByName(item.category)}
            onPress={async () => {
              const next = [item.id, ...recentVisitedIds.filter((id) => id !== item.id)].slice(
                0,
                20
              );
              setRecentVisitedIds(next);
              try {
                await AsyncStorage.setItem(recentStorageKey, JSON.stringify(next));
              } catch {
                // ignore
              }
              router.push({
                pathname: "/FoodRecipes/[id]",
                params: { id: item.id },
              });
            }}
          />
        )}
        ListHeaderComponent={
          <View>
          <CreateRecipe
            vegMode={vegMode}
            loading={generating}
            onGenerate={async (input, params) => {
              if (!user?.uid) return;
              try {
                setLastPrompt(input);
                setSuggestionsLoading(true);
                setSuggestionsVisible(true);
                const sug = await generateRecipeSuggestionsFromAI({
                  prompt: input,
                  vegType: params.vegMode ? "veg" : "non-veg",
                });
                setSuggestions(sug);
              } catch (e: any) {
                showToast(e?.message ?? "Failed to generate suggestions.");
                setSuggestionsVisible(false);
              } finally {
                setSuggestionsLoading(false);
              }
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

          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: "bold", fontSize: 20, marginBottom: 10 }}>
              Popular
            </Text>
            {loadingRecipes ? <ActivityIndicator /> : null}
            {!loadingRecipes && recipes.length === 0 ? (
              <Text>No recipes yet. Generate your first one above.</Text>
            ) : null}
            {!loadingRecipes
              ? popularIds
                  .map((id) => recipes.find((r) => r.id === id))
                  .filter(Boolean)
                  .map((r: any) => (
                    <RecipeCard
                      key={`popular:${r.id}`}
                      recipe={r}
                      imageSource={getCategoryImageByName(r.category)}
                      onPress={async () => {
                        const next = [r.id, ...recentVisitedIds.filter((id) => id !== r.id)].slice(
                          0,
                          20
                        );
                        setRecentVisitedIds(next);
                        try {
                          await AsyncStorage.setItem(recentStorageKey, JSON.stringify(next));
                        } catch {
                          // ignore
                        }
                      router.push({
                        pathname: "/FoodRecipes/[id]",
                        params: { id: String(r.id) },
                      });
                      }}
                    />
                  ))
              : null}
          </View>

          <View style={{ marginTop: 14 }}>
            <Text style={{ fontWeight: "bold", fontSize: 20, marginBottom: 10 }}>
              Recently visited
            </Text>
            {recentVisitedIds.length === 0 ? (
              <Text>Tap a recipe to see it here.</Text>
            ) : null}
            {recentVisitedIds.length
              ? recentVisitedIds
                  .map((id) => recipes.find((r) => r.id === id))
                  .filter(Boolean)
                  .slice(0, 3)
                  .map((r: any) => (
                    <RecipeCard
                      key={`recent:${r.id}`}
                      recipe={r}
                      imageSource={getCategoryImageByName(r.category)}
                      onPress={async () => {
                        const next = [r.id, ...recentVisitedIds.filter((id) => id !== r.id)].slice(
                          0,
                          20
                        );
                        setRecentVisitedIds(next);
                        try {
                          await AsyncStorage.setItem(recentStorageKey, JSON.stringify(next));
                        } catch {
                          // ignore
                        }
                        router.push({
                          pathname: "/FoodRecipes/[id]",
                          params: { id: String(r.id) },
                        });
                      }}
                    />
                  ))
              : null}
          </View>

          <View style={{ marginTop: 14 }}>
            <Text style={{ fontWeight: "bold", fontSize: 20, marginBottom: 10 }}>
              Generated Recipes
            </Text>
            {recipesError ? (
              <Text style={{ color: Colors.DANGER }}>{recipesError}</Text>
            ) : null}
          </View>
          </View>
        }
      />
      <Toast
        visible={toastVisible}
        message={toastMsg}
        onHidden={() => setToastMsg("")}
      />
      <SuggestionsSheet
        visible={suggestionsVisible}
        suggestions={suggestions}
        loading={suggestionsLoading || generating}
        onClose={() => {
          if (suggestionsLoading || generating) return;
          setSuggestionsVisible(false);
        }}
        onSelect={async (s) => {
          if (!user?.uid) return;
          setGenerating(true);
          try {
            const generated = await generateRecipesFromAI({
              prompt: `Main input: ${lastPrompt}\nSelected suggestion: ${s.title}\nMake sure the recipe includes the main ingredient(s) from the main input.`,
              vegType,
              count: 1,
            });

            const ids = await saveGeneratedRecipes({
              uid: user.uid,
              recipes: generated,
            });

            await refreshRecipes();
            showToast(`Created: ${s.title} ${s.emoji}`);
            setSuggestionsVisible(false);

            const id = ids[0];
            if (id) {
              router.push({ pathname: "/FoodRecipes/[id]", params: { id } });
            }
          } catch (e: any) {
            showToast(e?.message ?? "Failed to generate recipe.");
          } finally {
            setGenerating(false);
          }
        }}
      />
    </SafeAreaView>
  );
}

// (no local styles)
