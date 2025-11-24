import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ViewToken,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

interface OnboardingItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingItem[] = [
  {
    id: "1",
    icon: "game-controller",
    title: "Bem-vindo! 🎮",
    description:
      "Gerencie sua coleção de jogos PS2 de forma fácil e organizada. Selecione os jogos que deseja copiar para seu pendrive!",
    color: "#1e90ff",
  },
  {
    id: "2",
    icon: "search",
    title: "Busca Inteligente 🔍",
    description:
      "Use a barra de busca para encontrar rapidamente qualquer jogo pelo nome. A pesquisa é instantânea!",
    color: "#00bcd4",
  },
  {
    id: "3",
    icon: "image",
    title: "Capas dos Jogos 🎨",
    description:
      "Visualize as capas originais dos jogos. Use o switch 'Mostrar capas' para alternar entre lista com e sem imagens.",
    color: "#4caf50",
  },
  {
    id: "4",
    icon: "checkmark-circle",
    title: "Seleção Múltipla ✅",
    description:
      "Toque nos jogos para selecioná-los. O painel flutuante mostra o total de GB selecionado em tempo real.",
    color: "#ff9800",
  },
  {
    id: "5",
    icon: "hardware-chip",
    title: "Tamanho do Pendrive 💾",
    description:
      "Configure o tamanho do seu pendrive no painel flutuante. O app avisa se você ultrapassar o limite disponível!",
    color: "#9c27b0",
  },
  {
    id: "6",
    icon: "eye",
    title: "Detalhes do Jogo 📖",
    description:
      "Toque no ícone do olho para ver a descrição completa de cada jogo e sua capa em tamanho maior.",
    color: "#f44336",
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      finalizarOnboarding();
    }
  };

  const handleSkip = () => {
    finalizarOnboarding();
  };

  const finalizarOnboarding = async () => {
    try {
      await AsyncStorage.setItem("@onboarding_completo", "true");
      onComplete();
    } catch (error) {
      console.error("Erro ao salvar onboarding:", error);
      onComplete();
    }
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const renderItem = ({ item }: { item: OnboardingItem }) => (
    <View style={styles.slide}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={80} color="#fff" />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <LinearGradient colors={["#000428", "#004e92"]} style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Pular</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
                { backgroundColor: index === currentIndex ? "#1e90ff" : "#555" },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? "Começar" : "Próximo"}
          </Text>
          <Ionicons
            name={currentIndex === slides.length - 1 ? "checkmark" : "arrow-forward"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  slide: {
    width,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dotActive: {
    width: 30,
  },
  nextButton: {
    flexDirection: "row",
    backgroundColor: "#1e90ff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  nextText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
