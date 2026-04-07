import Colors from "@/services/Colors";
import { fetchRecipeById } from "@/services/recipesService";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCategoryImageByName } from "@/components/CategoryList";
import type { IngredientItem } from "@/services/types";
import { UserContext } from "@/context/UserContext";
import { addToCookbook, removeFromCookbook, listCookbookRecipeIds } from "@/services/cookbookService";
import { Ionicons } from "@expo/vector-icons";

export default function FoodRecipesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params?.id ? String(params.id) : "";
  const { user } = useContext(UserContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<any>(null);
  const [cookbookLoading, setCookbookLoading] = useState(false);
  const [inCookbook, setInCookbook] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) {
        setError("Missing recipe id.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRecipeById({ id });
        if (!data) {
          setError("Recipe not found.");
          return;
        }
        setRecipe(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load recipe.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      if (!user?.uid || !id) return;
      try {
        const ids = await listCookbookRecipeIds({ uid: user.uid });
        setInCookbook(ids.includes(id));
      } catch {
        setInCookbook(false);
      }
    })();
  }, [user?.uid, id]);

  const steps = useMemo(() => {
    const list = recipe?.instructions ?? [];
    return Array.isArray(list) ? list : [];
  }, [recipe?.instructions]);

  const ingredients = useMemo(() => {
    const list = recipe?.ingredients ?? [];
    return Array.isArray(list) ? list : [];
  }, [recipe?.ingredients]);

  const normalizedIngredients: IngredientItem[] = useMemo(() => {
    return ingredients
      .map((it: any) => {
        if (typeof it === "string") {
          // Backward compat: best-effort parse like "2 cup rice".
          const m = it.trim().match(/^(\d+(?:[./]\d+)?)\s*([a-zA-Z]+)?\s*(.*)$/);
          const quantity = m?.[1] ? String(m[1]) : "1";
          const unit = m?.[2] ? String(m[2]) : "unit";
          const name = (m?.[3] ?? it).trim() || "ingredient";
          return { name, quantity, unit, notes: "" };
        }
        return {
          name: String(it?.name ?? "").trim(),
          quantity: String(it?.quantity ?? "").trim(),
          unit: String(it?.unit ?? "").trim(),
          notes: String(it?.notes ?? "").trim(),
        };
      })
      .filter((x: IngredientItem) => x.name && x.quantity && x.unit);
  }, [ingredients]);

  const tips: string[] = useMemo(() => {
    const list = recipe?.tips ?? [];
    return Array.isArray(list) ? list.map((t: any) => String(t).trim()).filter(Boolean) : [];
  }, [recipe?.tips]);

  const description = useMemo(() => {
    const d = String(recipe?.description ?? "").trim();
    if (d) return d;
    const tip = tips.length ? tips[0] : "";
    if (tip) return tip;
    const first = steps.length ? steps[0] : "";
    if (first) return first.length > 110 ? `${first.slice(0, 110)}…` : first;
    return "Fresh, tasty, and easy to cook.";
  }, [recipe?.description, steps, tips]);

  const caloriesText = useMemo(() => {
    const c = Number(recipe?.caloriesKcal);
    return Number.isFinite(c) && c > 0 ? `${Math.round(c)} kcal` : "";
  }, [recipe?.caloriesKcal]);

  const timeText = useMemo(() => {
    const t = Number(recipe?.timeMinutes);
    return Number.isFinite(t) && t > 0 ? `${Math.round(t)} min` : "";
  }, [recipe?.timeMinutes]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.WHITE }} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <Text onPress={() => router.back()} style={styles.backBtn}>
            ← Back
          </Text>
        </View>

        {loading ? <ActivityIndicator style={{ marginTop: 10 }} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && !error && recipe ? (
          <View>
            <Pressable
              onPress={() => {
                // (Optional) later: open full-screen preview.
              }}
              style={styles.heroWrap}
            >
              <Image
                source={getCategoryImageByName(String(recipe.category ?? ""))}
                style={styles.heroImage}
              />
            </Pressable>

            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.recipeLabel}>Recipe Name:</Text>
                <Text style={styles.title}>{recipe.title}</Text>
                <Text style={styles.description}>{description}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={async () => {
                  if (!user?.uid) return;
                  setCookbookLoading(true);
                  try {
                    if (inCookbook)
                      await removeFromCookbook({ uid: user.uid, recipeId: id });
                    else await addToCookbook({ uid: user.uid, recipeId: id });
                    setInCookbook(!inCookbook);
                  } finally {
                    setCookbookLoading(false);
                  }
                }}
                disabled={cookbookLoading || !user?.uid}
                style={[
                  styles.saveIconBtn,
                  inCookbook ? styles.saveIconBtnActive : null,
                  (cookbookLoading || !user?.uid) ? { opacity: 0.55 } : null,
                ]}
              >
                <Ionicons
                  name={"bookmark-outline" as any}
                  size={20}
                  color={inCookbook ? "white" : Colors.BLACK}
                />
              </TouchableOpacity>
            </View>

            {(caloriesText || timeText) ? (
              <View style={styles.metaRow}>
                {caloriesText ? (
                  <View style={styles.metaPill}>
                    <Text style={styles.metaText}>Calories</Text>
                    <Text style={[styles.metaValue, { color: Colors.PRIMARY }]}>
                      {caloriesText}
                    </Text>
                  </View>
                ) : null}
                {timeText ? (
                  <View style={styles.metaPill}>
                    <Text style={styles.metaText}>Time</Text>
                    <Text style={[styles.metaValue, { color: Colors.INFO }]}>
                      {timeText}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            <Text style={styles.blockLabel}>Ingredients</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 1 }]}>Item</Text>
                <Text style={[styles.th, { width: 120, textAlign: "right" }]}>
                  Quantity
                </Text>
              </View>
              {normalizedIngredients.map((it, idx) => (
                <View key={`${it.name}-${idx}`} style={styles.tr}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tdName}>{it.name}</Text>
                    {it.notes ? <Text style={styles.tdNote}>{it.notes}</Text> : null}
                  </View>
                  <Text style={styles.tdQty}>
                    {it.quantity} {it.unit}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.blockLabel}>Instructions</Text>
            <View style={styles.stepsWrap}>
              {steps.map((step: string, idx: number) => (
                <View key={idx} style={styles.stepCard}>
                  <View style={styles.stepIndex}>
                    <Text style={styles.stepIndexText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.blockLabel}>Tips</Text>
            <View style={styles.tipsWrap}>
              {(tips.length ? tips : ["Keep heat medium and taste as you go."]).map((t, idx) => (
                <View key={idx} style={styles.tipRow}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 28,
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { color: Colors.PRIMARY, fontWeight: "800" },
  error: {
    color: Colors.DANGER,
    marginTop: 10,
  },
  heroWrap: { marginTop: 12, borderRadius: 18, overflow: "hidden" },
  heroImage: { width: "100%", height: 240, backgroundColor: "rgba(0,0,0,0.04)" },
  titleRow: { marginTop: 14, flexDirection: "row", gap: 12, alignItems: "flex-start" },
  recipeLabel: { color: Colors.GRAY, fontWeight: "900" },
  title: { fontSize: 22, fontWeight: "900", color: Colors.BLACK, marginTop: 4 },
  description: { marginTop: 8, color: "rgba(16,24,40,0.78)", lineHeight: 20 },
  saveIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.SURFACE,
  },
  saveIconBtnActive: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY },
  metaRow: { marginTop: 14, flexDirection: "row", gap: 10 },
  metaPill: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 16,
    padding: 12,
  },
  metaText: { color: Colors.GRAY, fontWeight: "900", fontSize: 12 },
  metaValue: { marginTop: 4, fontWeight: "900", fontSize: 16, color: Colors.BLACK },
  blockLabel: {
    marginTop: 18,
    fontWeight: "900",
    fontSize: 18,
    color: Colors.BLACK,
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 16,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  th: { fontWeight: "900", color: "rgba(0,0,0,0.7)" },
  tr: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
    backgroundColor: "white",
  },
  tdName: { fontWeight: "900", color: Colors.BLACK },
  tdNote: { marginTop: 2, color: Colors.GRAY, fontWeight: "700", fontSize: 12 },
  tdQty: { width: 120, textAlign: "right", fontWeight: "900", color: Colors.BLACK },
  stepsWrap: { marginTop: 10, gap: 10 },
  stepCard: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    backgroundColor: "white",
  },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: Colors.SECONDARY,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndexText: { fontWeight: "900", color: Colors.PRIMARY },
  stepText: { flex: 1, color: "rgba(16,24,40,0.86)", lineHeight: 20, fontWeight: "700" },
  tipsWrap: {
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    backgroundColor: "rgba(0,0,0,0.02)",
    gap: 8,
  },
  tipRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  tipBullet: { fontWeight: "900", color: Colors.PRIMARY, marginTop: 1 },
  tipText: { flex: 1, lineHeight: 20, color: "rgba(16,24,40,0.82)", fontWeight: "700" },
});

