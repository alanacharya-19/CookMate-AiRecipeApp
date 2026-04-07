export type VegType = "veg" | "non-veg";

export type UserProfile = {
  uid: string;
  name?: string;
  email?: string;
  picture?: string;
};

export type IngredientItem = {
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
};

export type GeneratedRecipe = {
  title: string;
  description?: string;
  caloriesKcal?: number;
  timeMinutes?: number;
  ingredients: Array<string | IngredientItem>;
  instructions: string[];
  tips?: string[];
  vegType: VegType;
  category: string;
};

export type RecipeDoc = GeneratedRecipe & {
  id: string;
  uid: string;
  createdAt?: unknown;
};

