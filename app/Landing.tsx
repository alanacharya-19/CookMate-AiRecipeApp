import Colors from "@/services/Colors";
import { Marquee } from "@animatereactnative/marquee";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserContext } from "@/context/UserContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Landing() {
  const { user, authReady } = useContext(UserContext);
  const router = useRouter();

  const rotate = (arr: any[], by: number) => {
    const n = arr.length;
    if (n === 0) return arr;
    const k = ((by % n) + n) % n;
    return [...arr.slice(k), ...arr.slice(0, k)];
  };

  const handleGetStarted = async () => {
    if (authReady && user) router.replace("/(tabs)/Home");
    else router.replace("/Auth");
  };

  const imageList = [
    require("./../assets/images/1.jpg"),
    require("./../assets/images/2.jpg"),
    require("./../assets/images/3.jpg"),
    require("./../assets/images/4.jpg"),
    require("./../assets/images/5.jpg"),
    require("./../assets/images/6.jpg"),
    require("./../assets/images/7.jpg"),
    require("./../assets/images/8.jpg"),
    require("./../assets/images/9.jpg"),
    require("./../assets/images/10.jpg"),
  ];

  const row1 = imageList;
  const row2 = rotate(imageList, 3);
  const row3 = rotate(imageList, 6);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.WHITE }} edges={["top"]}>
      <View>
        <Marquee
          spacing={10}
          speed={0.7}
          style={{
            transform: [{ rotate: "-4deg" }],
            marginTop: 10,
          }}
        >
          <View style={styles.imageContainer}>
            {row1.map((image, index) => (
              <Image key={index} source={image} style={styles.image} />
            ))}
          </View>
        </Marquee>
        <Marquee
          spacing={10}
          speed={0.7}
          style={{
            transform: [{ rotate: "-4deg" }],
            marginTop: 10,
          }}
        >
          <View style={styles.imageContainer}>
            {row2.map((image, index) => (
              <Image key={index} source={image} style={styles.image} />
            ))}
          </View>
        </Marquee>
        <Marquee
          spacing={10}
          speed={0.7}
          style={{
            transform: [{ rotate: "-4deg" }],
            marginTop: 10,
          }}
        >
          <View style={styles.imageContainer}>
            {row3.map((image, index) => (
              <Image key={index} source={image} style={styles.image} />
            ))}
          </View>
        </Marquee>
      </View>
      <View
        style={{
          backgroundColor: Colors.WHITE,
          height: "100%",
          padding: 20,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 30,
            fontWeight: "bold",
          }}
        >
          CookMate 🍝| Find, Create & Enjoy Delicious Recipes!{" "}
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontFamily: "outfit",
            fontSize: 17,
            color: Colors.GRAY,
            marginTop: 7,
          }}
        >
          Generate delicious recipes in seconds seconds with the power of AI
          🍔✨
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
        >
          <Text
            style={{
              textAlign: "center",
              color: Colors.WHITE,
              fontSize: 20,
            }}
          >
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 160,
    height: 160,
    borderRadius: 25,
  },
  imageContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
  },
});
