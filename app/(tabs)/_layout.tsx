import { Tabs, useRouter } from "expo-router";
import React, { useContext, useEffect } from "react";
import { Image } from "react-native";
import { UserContext } from "@/context/UserContext";

export default function TabLayout() {
  const router = useRouter();
  const { user, authReady } = useContext(UserContext);

  useEffect(() => {
    if (!authReady) return;
    if (!user) router.replace("/Auth");
  }, [authReady, user, router]);

  if (!authReady) return null;

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="Home"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={require("../../assets/images/i1.png")}
              style={{
                width: size,
                height: size,
                opacity: focused ? 1 : 0.4,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Explore"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={require("../../assets/images/i2.png")}
              style={{
                width: size,
                height: size,
                opacity: focused ? 1 : 0.4,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Cookbook"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={require("../../assets/images/i3.png")}
              style={{
                width: size,
                height: size,
                opacity: focused ? 1 : 0.4,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={require("../../assets/images/i4.png")}
              style={{
                width: size,
                height: size,
                opacity: focused ? 1 : 0.4,
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
