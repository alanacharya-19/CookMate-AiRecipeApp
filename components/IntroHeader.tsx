import { UserContext } from "@/context/UserContext";
import Colors from "@/services/Colors";
import React, { useContext } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function IntroHeader({
  vegMode,
  onVegModeChange,
}: {
  vegMode: boolean;
  onVegModeChange: (next: boolean) => void;
}) {
  const { user } = useContext(UserContext);

  const rawName = String(user?.name ?? "").trim();
  const safeName = rawName.includes("@") ? rawName.split("@")[0] : rawName;
  const firstName =
    safeName
      .trim()
      .split(/\s+/)
      .filter(Boolean)[0] || "Chef";

  const greetingName =
    firstName.length > 0
      ? firstName.charAt(0).toUpperCase() + firstName.slice(1)
      : "Chef";

  // Keep local import-free styling logic simple.
  const avatarSource = user?.picture
    ? { uri: user.picture }
    : require("./../assets/images/logo.png");

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Image
          source={avatarSource}
          style={{
            width: 40,
            height: 45,
            borderRadius: 99,
          }}
        />
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          Hello, {greetingName}
        </Text>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => onVegModeChange(!vegMode)}
          style={[styles.toggle, vegMode ? styles.toggleActiveVeg : styles.toggleActiveNonVeg]}
        >
          <Text
            style={[styles.toggleText, styles.toggleTextActive]}
          >
            {vegMode ? "Veg" : "Non-Veg"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  toggleActiveVeg: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  toggleActiveNonVeg: {
    backgroundColor: Colors.DANGER,
    borderColor: Colors.DANGER,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: Colors.WHITE,
  },
});


