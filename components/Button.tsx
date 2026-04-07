import Colors from "@/services/Colors";
import Octicons from "@expo/vector-icons/Octicons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function Button({
  label,
  onPress,
  iconName = "",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  iconName?: string;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      disabled={disabled}
      style={[styles.button, disabled ? styles.disabled : null]}
      onPress={onPress}
    >
      {iconName ? <Octicons name={iconName as any} size={24} color="white" /> : null}
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    textAlign: "center",
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
});
