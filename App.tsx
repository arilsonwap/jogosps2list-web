import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

// 🧩 Importa todos os conjuntos de ícones que você usa
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
  Entypo,
  Feather,
} from "@expo/vector-icons";

import HomeScreen from "./src/screens/HomeScreen";

// Evita esconder a splash antes de as fontes carregarem
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  // ✅ Carrega todas as fontes de ícones
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    ...FontAwesome.font,
    ...Entypo.font,
    ...Feather.font,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // ⚠️ Enquanto as fontes não carregam, não renderiza nada
  if (!fontsLoaded) return null;

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
              
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
