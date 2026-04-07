import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type CategoryItem = {
  id: string;
  name: string;
  image: any;
};

export const categories: CategoryItem[] = [
  {
    id: "1",
    name: "Breakfast",
    image: require("./../assets/images/breakfast.png"),
  },
  { id: "2", name: "Drink", image: require("./../assets/images/drink.png") },
  { id: "3", name: "Cake", image: require("./../assets/images/cake.png") },
  {
    id: "4",
    name: "Dinner",
    image: require("./../assets/images/dinner.png"),
  },
  { id: "5", name: "Salad", image: require("./../assets/images/salad.png") },
  {
    id: "6",
    name: "Fastfood",
    image: require("./../assets/images/fastfood.png"),
  },
  {
    id: "7",
    name: "Dessert",
    image: require("./../assets/images/dessert.png"),
  },
  { id: "8", name: "Lunch", image: require("./../assets/images/lunch.png") },
];

export function getCategoryImageByName(categoryName: string) {
  const key = String(categoryName).toLowerCase();

  const extra: Record<string, any> = {
    noodles: require("./../assets/images/1.jpg"),
    "fast food": require("./../assets/images/2.jpg"),
    pizza: require("./../assets/images/3.jpg"),
    snack: require("./../assets/images/4.jpg"),
  };

  const found = categories.find((c) => c.name.toLowerCase() === key);
  if (found) return found.image;
  if (extra[key]) return extra[key];

  return require("./../assets/images/logo.png");
}

export default function CategoryList({
  onPressCategory,
}: {
  onPressCategory: (category: CategoryItem) => void;
}) {
  // Exactly 2 rows (4 columns x 2 rows)
  const gridItems = categories.slice(0, 8);

  return (
    <View style={{ marginTop: 15 }}>
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 20,
          marginBottom: 10,
        }}
      >
        Category
      </Text>

      <View style={styles.grid}>
        {gridItems.map((item) => (
          <View key={item.id} style={styles.cell}>
            <TouchableOpacity
              style={styles.item}
              onPress={() => onPressCategory(item)}
              activeOpacity={0.7}
            >
              <Image source={item.image} style={styles.icon} />
              <Text style={styles.label} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: "25%",
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  item: {
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 10,

    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "transparent",
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    opacity: 0.95,
  },
  label: {
    marginTop: 6,
    fontSize: 12,
  },
});
