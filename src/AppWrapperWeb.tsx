// src/AppWrapperWeb.tsx
import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import HomeScreen from "./screens/HomeScreen";

export default function AppWrapperWeb() {
  // 📱 Se estiver no navegador, centraliza e aplica moldura de smartphone
  if (Platform.OS === "web") {
    return (
      <View style={styles.webContainer}>
        <View style={styles.phoneFrame}>
          <View style={styles.notch} />
          <HomeScreen />
        </View>
      </View>
    );
  }

  // 📲 No Android, exibe normalmente
  return <HomeScreen />;
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: "#000", // Fundo escuro em volta
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100vw",
  },

  /* Moldura do smartphone */
  phoneFrame: {
    width: 420, // largura de um celular moderno
    height: 860,
    borderRadius: 42,
    overflow: "hidden",
    backgroundColor: "#000",
    borderWidth: 10,
    borderColor: "#111",
    boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
    position: "relative",
  },

  /* Simulação do notch superior */
  notch: {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: [{ translateX: -60 }],
    width: 120,
    height: 30,
    backgroundColor: "#000",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 10,
  },
});
