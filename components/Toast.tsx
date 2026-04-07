import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Colors from "@/services/Colors";

export default function Toast({
  message,
  visible,
  onHidden,
}: {
  message: string;
  visible: boolean;
  onHidden?: () => void;
}) {
  const translateY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const anim = useMemo(
    () =>
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: visible ? 0 : 60,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: visible ? 1 : 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
    [opacity, translateY, visible]
  );

  useEffect(() => {
    anim.start(({ finished }) => {
      if (!finished) return;
      if (!visible) onHidden?.();
    });
  }, [anim, onHidden, visible]);

  return (
    <View pointerEvents="none" style={styles.root}>
      <Animated.View
        style={[
          styles.toast,
          { transform: [{ translateY }], opacity },
        ]}
      >
        <Text style={styles.text} numberOfLines={2}>
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: "center",
  },
  toast: {
    backgroundColor: Colors.BLACK,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    maxWidth: "90%",
  },
  text: {
    color: "white",
    fontSize: 14,
    lineHeight: 18,
  },
});

