import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Animated,
  Easing,
  ScrollView,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

/* ------------------------------------------------------------------
   ✅ Extensão de tipos para suportar "position: fixed" no React Native Web
------------------------------------------------------------------ */
declare module "react-native" {
  interface ViewStyle {
    position?: "absolute" | "relative" | "static" | "fixed";
  }
}

export type PenDriveInfo = {
  tamanho?: number;
  real?: number;
} | null;

export type OnPenDriveChange = (info: PenDriveInfo) => void;

interface FloatingPanelProps {
  totalGB: string;
  quantidade: number;
  ultrapassou?: boolean;
  onPenDriveChange?: OnPenDriveChange;
  selecionados?: { nome: string; tamanho_gb: number; bandeira?: string }[];
}

export default function FloatingPanel({
  totalGB,
  quantidade,
  ultrapassou,
  onPenDriveChange,
  selecionados = [],
}: FloatingPanelProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [listaVisible, setListaVisible] = useState(false);
  const [precoVisible, setPrecoVisible] = useState(false);
  const [penDriveSize, setPenDriveSize] = useState<number | null>(null);

  // 💰 Cálculo de preço
  const precoTotal = (() => {
    if (quantidade === 0) return 0;
    if (quantidade <= 3) return quantidade * 10;
    return 30 + (quantidade - 3) * 5;
  })();

  // 💾 Tamanhos reais
  const tamanhosReais = [
    { tamanho: 8, real: 7.45 },
    { tamanho: 16, real: 14.9 },
    { tamanho: 32, real: 29.8 },
    { tamanho: 64, real: 59.6 },
    { tamanho: 128, real: 119.2 },
    { tamanho: 256, real: 238.4 },
  ];

  const total = parseFloat(totalGB) || 0;
  const realSize = penDriveSize
    ? tamanhosReais.find((t) => t.tamanho === penDriveSize)?.real || 0
    : 0;
  const usado = realSize ? Math.min((total / realSize) * 100, 100) : 0;

  // 💾 Verifica se o total ultrapassa o tamanho do pen drive
  const ultrapassouLimite = !!(penDriveSize && realSize && total > realSize);

  // 🎨 Animação cor suave
  const colorAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: ultrapassouLimite ? 1 : 0,
      duration: 600,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [ultrapassouLimite]);

  const interpolatedColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#1e1e1ecc", "#ff3333cc"],
  });

  // ⚠️ Alerta animado
  const alertOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(alertOpacity, {
      toValue: ultrapassouLimite ? 1 : 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [ultrapassouLimite]);

  // 💾 Pulso no ícone USB
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (ultrapassouLimite) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [ultrapassouLimite]);

  // 🧠 Seleção Pen Drive
  const handleSelectPenDrive = (item: { tamanho: number; real: number }) => {
    if (penDriveSize === item.tamanho) {
      setPenDriveSize(null);
      onPenDriveChange?.(null);
    } else {
      setPenDriveSize(item.tamanho);
      onPenDriveChange?.(item);
    }
    setModalVisible(false);
  };

  // 📤 Compartilhar lista direto no WhatsApp (web + mobile)
  const handleShareList = async () => {
    if (!selecionados.length) {
      Alert.alert("Nenhum jogo selecionado", "Selecione alguns jogos antes de compartilhar.");
      return;
    }

    const MEU_WHATSAPP = "5597991895986";
    let mensagem = `🎮 *LISTA DE JOGOS PS2* 🎮\n\n`;
    mensagem += `📊 *Total:* ${quantidade} ${quantidade === 1 ? "jogo" : "jogos"}\n`;
    mensagem += `💾 *Tamanho:* ${totalGB} GB\n\n`;

    selecionados.forEach((jogo, index) => {
      const numero = String(index + 1).padStart(2, "0");
      const bandeira = jogo.bandeira || "🌍";
      mensagem += `${bandeira} *${numero}.* ${jogo.nome}\n`;
    });

    mensagem += `\n✅ _Lista gerada pelo app Coleção PS2_`;

    const mensagemCodificada = encodeURIComponent(mensagem);
    const urlWhatsApp = `https://wa.me/${MEU_WHATSAPP}?text=${mensagemCodificada}`;

    try {
      if (Platform.OS === "web") {
        window.open(urlWhatsApp, "_blank");
      } else {
        const podeAbrir = await Linking.canOpenURL(urlWhatsApp);
        if (podeAbrir) {
          await Linking.openURL(urlWhatsApp);
        } else {
          const fallback = `whatsapp://send?phone=${MEU_WHATSAPP}&text=${mensagemCodificada}`;
          await Linking.openURL(fallback);
        }
      }
    } catch (error) {
      console.error("Erro ao abrir WhatsApp:", error);
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp.");
    }
  };

  return (
    <>
      {/* ⚠️ Alerta */}
      <Animated.View
        style={[
          styles.alertBox,
          {
            opacity: alertOpacity,
            transform: [
              {
                translateY: alertOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.alertText}>⚠ Espaço insuficiente no pen drive</Text>
      </Animated.View>

      {/* 🔹 Linha principal */}
      <View style={styles.floatingRow}>
        <Animated.View style={[styles.panel, { backgroundColor: interpolatedColor }]}>
          <Ionicons name="game-controller-outline" size={22} color="#fff" />
          <View style={{ marginLeft: 8 }}>
            {quantidade > 0 ? (
              <>
                <Text style={styles.text}>
                  {quantidade} jogo{quantidade > 1 ? "s" : ""} — {totalGB} GB
                </Text>
                {penDriveSize && (
                  <View style={styles.progressBox}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${usado}%`,
                          backgroundColor: ultrapassouLimite ? "#ff5555" : "#4facfe",
                        },
                      ]}
                    />
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.text}>Nenhum jogo selecionado</Text>
            )}
          </View>
        </Animated.View>

        {/* 📘 Botão lista */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.listButton}
          onPress={() => setListaVisible(true)}
        >
          <Ionicons name="list" size={26} color="#fff" />
        </TouchableOpacity>

        {/* Coluna direita */}
        <View style={styles.verticalButtons}>
          {/* 💚 Botão preço */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.priceButton}
            onPress={() => setPrecoVisible(true)}
          >
            <View style={styles.priceContent}>
              <Text style={styles.moeda}>R$</Text>
              <Text style={styles.valor}>
                {precoTotal > 0 ? precoTotal.toFixed(0) : "0"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* 🟣 Botão USB */}
          <Animated.View
            style={[
              styles.usbButton,
              { transform: [{ scale: pulseAnim }] },
              ultrapassouLimite && { backgroundColor: "#ff5555" },
            ]}
          >
            <TouchableOpacity activeOpacity={0.8} onPress={() => setModalVisible(true)}>
              <MaterialCommunityIcons name="usb-flash-drive" size={26} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* 💾 Modal Pen Drive */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Selecione o tamanho do Pen Drive</Text>
            <FlatList
              data={tamanhosReais}
              numColumns={3}
              keyExtractor={(item) => item.tamanho.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    penDriveSize === item.tamanho && styles.optionSelected,
                  ]}
                  onPress={() => handleSelectPenDrive(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      penDriveSize === item.tamanho && styles.optionTextSelected,
                    ]}
                  >
                    {item.tamanho} GB
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 📋 Modal Lista */}
      <Modal visible={listaVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.bigModalBox}>
            <Text style={styles.modalTitle}>
              Jogos Selecionados ({selecionados.length})
            </Text>

            {selecionados.length > 0 ? (
              <>
                <ScrollView style={{ maxHeight: 400, width: "100%" }}>
                  {selecionados.map((jogo, i) => (
                    <View key={i} style={styles.jogoLinha}>
                      <Text style={styles.jogoNome}>{jogo.nome}</Text>
                      <Text style={styles.jogoTamanho}>{jogo.tamanho_gb} GB</Text>
                    </View>
                  ))}
                </ScrollView>

                {/* 📤 Botão Compartilhar WhatsApp */}
                <TouchableOpacity style={styles.shareButton} onPress={handleShareList}>
                  <Ionicons name="logo-whatsapp" size={22} color="#fff" />
                  <Text style={styles.shareText}>Enviar no WhatsApp</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={{ color: "#ccc", marginTop: 10 }}>Nenhum jogo selecionado.</Text>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={() => setListaVisible(false)}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 💰 Modal de preço aprimorado */}
      <Modal visible={precoVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>💰 Como funciona o valor dos jogos</Text>
            <Text style={styles.modalText}>
              Cada jogo tem um preço base, e quanto mais jogos você seleciona,
              menor fica o preço por unidade:
            </Text>

            <View style={styles.priceInfoBox}>
              <Text style={styles.priceRule}>🎮 Até 3 jogos → R$10 cada</Text>
              <Text style={styles.priceRule}>🕹️ A partir do 4º → R$5 cada adicional</Text>
            </View>

            <Text style={styles.priceExamplesTitle}>📊 Exemplos práticos:</Text>
            <View style={styles.exampleList}>
              <Text style={styles.exampleText}>• 1 jogo = R$10</Text>
              <Text style={styles.exampleText}>• 3 jogos = R$30</Text>
              <Text style={styles.exampleText}>• 4 jogos = R$35</Text>
              <Text style={styles.exampleText}>• 5 jogos = R$40</Text>
              <Text style={styles.exampleText}>• 6 jogos = R$45</Text>
            </View>

            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>💵 Total atual:</Text>
              <Text style={styles.totalValue}>
                R$ {precoTotal.toFixed(2).replace(".", ",")}
              </Text>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={() => setPrecoVisible(false)}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ---------------- Estilos ---------------- */
const styles = StyleSheet.create({
  floatingRow: {
    position: Platform.OS === "web" ? "fixed" : "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 5,
    width: "100%",
    zIndex: 99,
  },
  alertBox: { position: "absolute", bottom: 110, left: 0, right: 0, alignItems: "center" },
  alertText: {
    backgroundColor: "#ff4444",
    color: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontWeight: "600",
  },
  panel: {
    width: 260,
    maxWidth: "90%",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: "auto",
  },
  text: { color: "#fff", fontSize: 15, fontWeight: "500", textAlign: "center" },
  progressBox: { width: 200, height: 6, backgroundColor: "#333", borderRadius: 5, marginTop: 6 },
  progressBar: { height: 6, borderRadius: 5 },
  verticalButtons: { flexDirection: "column", alignItems: "center", gap: 10 },
  usbButton: {
    backgroundColor: "#7c4dff",
    width: 58,
    height: 58,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  listButton: {
    backgroundColor: "#1e90ff",
    width: 58,
    height: 58,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  priceButton: {
    backgroundColor: "#4CAF50",
    width: 58,
    height: 58,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  priceContent: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  moeda: { fontSize: 12, color: "#fff", fontWeight: "600", marginRight: 2 },
  valor: { fontSize: 22, color: "#fff", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000a",
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  modalBox: {
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 12,
    width: "85%",
    alignItems: "center",
  },
  bigModalBox: {
    backgroundColor: "#1c1c1c",
    padding: 20,
    borderRadius: 12,
    width: "85%",
    maxHeight: "80%",
  },
  modalTitle: { color: "#fff", fontSize: 18, marginBottom: 10, fontWeight: "600", textAlign: "center" },
  modalText: { color: "#ddd", fontSize: 15, lineHeight: 22, textAlign: "center" },
  priceInfoBox: {
    marginVertical: 10,
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: "100%",
  },
  priceRule: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginVertical: 3,
  },
  priceExamplesTitle: {
    color: "#4facfe",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 4,
    textAlign: "center",
  },
  exampleList: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 10,
    width: "100%",
    marginBottom: 10,
  },
  exampleText: { color: "#ccc", fontSize: 14, marginVertical: 2, textAlign: "center" },
  totalBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 5,
    gap: 6,
  },
  totalLabel: { color: "#fff", fontSize: 16, fontWeight: "600" },
  totalValue: { color: "#4CAF50", fontSize: 18, fontWeight: "bold" },
  option: { backgroundColor: "#333", padding: 10, borderRadius: 8, margin: 6 },
  optionSelected: { backgroundColor: "#4facfe44", borderColor: "#4facfe", borderWidth: 1 },
  optionText: { color: "#ccc", fontSize: 14 },
  optionTextSelected: { color: "#fff", fontWeight: "bold" },
  jogoLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: "#333",
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  jogoNome: { color: "#fff", flex: 1, fontSize: 13 },
  jogoTamanho: { color: "#aaa", width: 60, textAlign: "right", fontSize: 13 },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#444",
    borderRadius: 20,
    padding: 8,
    alignSelf: "center",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25D366",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 15,
  },
  shareText: { color: "#fff", fontWeight: "600", marginLeft: 8, fontSize: 15 },
});
