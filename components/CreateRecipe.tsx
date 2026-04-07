import Colors from "@/services/Colors";
import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import Button from "./Button";

export default function CreateRecipe({
  vegMode,
  onGenerate,
  loading = false,
}: {
  vegMode: boolean;
  onGenerate: (input: string, params: { vegMode: boolean }) => Promise<void>;
  loading?: boolean;
}) {
  const [userInput, setUserInput] = useState<string>("");
  return (
    <View style={styles.container}>
      <Image
        source={require("./../assets/images/pan.gif")}
        style={styles.panImage}
      />
      <Text style={styles.heading}>
        Warm up your Stove, and let us get cooking!
      </Text>
      <Text style={styles.subHeading}>Make something for your LOVE</Text>
      <TextInput
        style={styles.textInput}
        multiline={true}
        numberOfLines={3}
        placeholder="What you want to create? Add ingredients etc."
        onChangeText={(value) => setUserInput(value)}
      />
      <Button
        label={"Generate Recipes"}
        disabled={loading || userInput.trim().length === 0}
        onPress={async () => {
          if (loading) return;
          const trimmed = userInput.trim();
          if (!trimmed) return;
          await onGenerate(trimmed, { vegMode });
          setUserInput("");
        }}
        iconName={"sparkles-fill"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    padding: 15,
    backgroundColor: Colors.SECONDARY,
    borderRadius: 25,
    display: "flex",
    alignItems: "center",
  },
  panImage: {
    width: 80,
    height: 80,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
  },
  subHeading: {
    fontSize: 14,
    marginTop: 6,
  },
  textInput: {
    backgroundColor: Colors.WHITE,
    width: "100%",
    borderRadius: 15,
    height: 120,
    marginTop: 8,
    padding: 15,
    textAlignVertical: "top",
    fontSize: 14,
  },
});
