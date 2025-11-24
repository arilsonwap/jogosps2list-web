// src/screens/HomeScreen.tsx
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image as ExpoImage } from "expo-image";
import romsData from "../../roms_ps2_unido.json";
import { getJogosNovos } from "../services/FirestoreService.web";
import { capasMap } from "../data/capasMap";
import FloatingPanel from "../components/FloatingPanel";

/* ---------------- Tipagem ---------------- */
interface JogoPS2 {
  nome: string;
  tamanho_gb: number;
  codigos?: string[] | string;
  descricao?: string;
  capa_url?: string;
}

/* ---------------- Item da lista ---------------- */
const JogoItem = React.memo(
  ({
    item,
    selecionado,
    toggleSelecao,
    formatarNome,
    mostrarCapas,
    abrirDetalhe,
  }: {
    item: JogoPS2;
    selecionado: boolean;
    toggleSelecao: (nome: string) => void;
    formatarNome: (nome: string) => { nome: string; bandeira: string };
    mostrarCapas: boolean;
    abrirDetalhe: (jogo: JogoPS2) => void;
  }) => {
    const { nome: nomeFormatado, bandeira } = formatarNome(item.nome);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    }, [scaleAnim]);

    const handleToggle = useCallback(() => toggleSelecao(item.nome), [item.nome, toggleSelecao]);
    const handleOpenDetail = useCallback(() => abrirDetalhe(item), [abrirDetalhe, item]);

    const code = useMemo(() => {
      const c = Array.isArray(item.codigos) ? item.codigos[0] : item.codigos;
      return c?.toUpperCase();
    }, [item.codigos]);

    const capaLocal = code ? (capasMap as Record<string, any>)[code] : undefined;

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleToggle}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.item, selecionado && { backgroundColor: "#1e90ff55" }]}
          accessibilityLabel={`${nomeFormatado} ${bandeira}, ${item.tamanho_gb} GB`}
          accessibilityHint={selecionado ? "Toque para desmarcar" : "Toque para selecionar"}
          accessibilityRole="button"
          accessibilityState={{ selected: selecionado }}
        >
          {mostrarCapas &&
            (item.capa_url ? (
              <ExpoImage
                source={{ uri: item.capa_url }}
                style={styles.capa}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : capaLocal ? (
              <ExpoImage
                source={capaLocal}
                style={styles.capa}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={[styles.capa, styles.semCapa]}>
                <Ionicons name="image-outline" size={28} color="#666" />
              </View>
            ))}

          <View style={styles.infoBox}>
            <View style={styles.nomeBox}>
              <Text style={styles.nome} numberOfLines={1}>
                {nomeFormatado}
              </Text>
              {!!bandeira && <Text style={styles.flag}> {bandeira}</Text>}
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.tamanho}>{item.tamanho_gb} GB</Text>
              <TouchableOpacity
                style={styles.olhoButton}
                onPress={handleOpenDetail}
                accessibilityLabel="Ver detalhes do jogo"
                accessibilityHint="Abre uma tela com informações e capa do jogo"
                accessibilityRole="button"
              >
                <Ionicons name="eye-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

/* ---------------- Tela Principal ---------------- */
export default function HomeScreen() {
  const [mostrarCapas, setMostrarCapas] = useState(true);
  const [buscaInput, setBuscaInput] = useState("");
  const [busca, setBusca] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [jogoDetalhe, setJogoDetalhe] = useState<JogoPS2 | null>(null);
  const [jogosFirebase, setJogosFirebase] = useState<JogoPS2[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tamanhoPenDrive, setTamanhoPenDrive] = useState<number>(0);

  /* ---- Buscar novos jogos do Firestore ---- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const novos = await getJogosNovos();
        setJogosFirebase(novos);
      } catch (err) {
        console.error("Erro ao carregar jogos Firebase:", err);
        setError("Erro ao carregar jogos do servidor. Exibindo apenas jogos locais.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---- Dados Locais ---- */
  const romsLocal = useMemo(
    () => (romsData as JogoPS2[]).sort((a, b) => a.nome.localeCompare(b.nome)),
    []
  );

  /* ---- Mescla Locais + Firebase ---- */
  const roms = useMemo(() => {
    return [...romsLocal, ...jogosFirebase].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );
  }, [romsLocal, jogosFirebase]);

  /* ---- Busca ---- */
  useEffect(() => {
    const t = setTimeout(() => setBusca(buscaInput.trim()), 200);
    return () => clearTimeout(t);
  }, [buscaInput]);

  const formatarNome = useCallback((nome: string) => {
    let nomeLimpo = nome.replace(/\.iso$/i, "").trim();
    let bandeira = "";
    if (/\(BR\)/i.test(nomeLimpo)) bandeira = "🇧🇷";
    else if (/\(USA\)|\(US\)/i.test(nomeLimpo)) bandeira = "🇺🇸";
    else if (/\(PT\)/i.test(nomeLimpo)) bandeira = "🇵🇹";
    else if (/\(JP\)/i.test(nomeLimpo)) bandeira = "🇯🇵";
    nomeLimpo = nomeLimpo.replace(/\(BR\)|\(USA\)|\(US\)|\(PT\)|\(JP\)/gi, "").trim();
    return { nome: nomeLimpo, bandeira };
  }, []);

  const filtrados = useMemo(() => {
    if (!busca) return roms;
    const b = busca.toLowerCase();
    return roms.filter((jogo) => formatarNome(jogo.nome).nome.toLowerCase().includes(b));
  }, [busca, roms, formatarNome]);

  /* ---- Seleção ---- */
  const toggleSelecao = useCallback((nome: string) => {
    setSelecionados((prev) =>
      prev.includes(nome) ? prev.filter((n) => n !== nome) : [...prev, nome]
    );
  }, []);

  const limparSelecao = useCallback(() => setSelecionados([]), []);
  const selecionadosSet = useMemo(() => new Set(selecionados), [selecionados]);

  /* ---- Soma de GB ---- */
  const totalGB = useMemo(() => {
    let soma = 0;
    for (const j of roms) if (selecionadosSet.has(j.nome)) soma += j.tamanho_gb;
    return soma.toFixed(2);
  }, [selecionadosSet, roms]);

  /* ---- Verifica se ultrapassou o tamanho do pen drive ---- */
  const ultrapassou = useMemo(() => {
    if (tamanhoPenDrive === 0) return false;
    return parseFloat(totalGB) > tamanhoPenDrive;
  }, [totalGB, tamanhoPenDrive]);

  /* ---- UI ---- */
  const renderItem = useCallback(
    ({ item }: { item: JogoPS2 }) => (
      <JogoItem
        item={item}
        selecionado={selecionadosSet.has(item.nome)}
        toggleSelecao={toggleSelecao}
        formatarNome={formatarNome}
        mostrarCapas={mostrarCapas}
        abrirDetalhe={setJogoDetalhe}
      />
    ),
    [selecionadosSet, toggleSelecao, formatarNome, mostrarCapas]
  );

  return (
    <LinearGradient colors={["#000428", "#004e92"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎮 JOGOS PS2 ({roms.length})</Text>
        <Switch
          value={mostrarCapas}
          onValueChange={setMostrarCapas}
          thumbColor={mostrarCapas ? "#1e90ff" : "#555"}
        />
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.input}
          placeholder="Buscar jogo..."
          placeholderTextColor="#999"
          value={buscaInput}
          onChangeText={setBuscaInput}
          accessibilityLabel="Campo de busca de jogos"
          accessibilityHint="Digite o nome do jogo que você deseja encontrar"
        />
        {selecionados.length > 0 && (
          <TouchableOpacity
            onPress={limparSelecao}
            accessibilityLabel="Limpar seleção"
            accessibilityHint="Remove todos os jogos selecionados"
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.statusMessage}>
          <Text style={styles.statusText}>⏳ Carregando jogos do servidor...</Text>
        </View>
      )}

      {error && (
        <View style={[styles.statusMessage, styles.errorMessage]}>
          <Ionicons name="warning-outline" size={16} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={filtrados}
        keyExtractor={(item, index) => `${item.nome}-${index}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Selecionados: {selecionados.length} — Total: {totalGB} GB
        </Text>
      </View>

      {/* Modal de detalhes */}
      {jogoDetalhe && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{jogoDetalhe.nome}</Text>
            {(() => {
              const code = Array.isArray(jogoDetalhe.codigos)
                ? jogoDetalhe.codigos[0]
                : jogoDetalhe.codigos;
              const capaLocal = code ? (capasMap as Record<string, any>)[code] : undefined;
              if (jogoDetalhe.capa_url) {
                return (
                  <ExpoImage
                    source={{ uri: jogoDetalhe.capa_url }}
                    style={styles.modalImage}
                    contentFit="contain"
                  />
                );
              } else if (capaLocal) {
                return (
                  <ExpoImage source={capaLocal} style={styles.modalImage} contentFit="contain" />
                );
              } else {
                return <Text style={{ color: "#aaa" }}>Sem capa</Text>;
              }
            })()}
            <Text style={styles.modalDesc}>
              {jogoDetalhe.descricao || "Sem descrição disponível."}
            </Text>
            <TouchableOpacity
              onPress={() => setJogoDetalhe(null)}
              style={styles.modalCloseBtn}
              accessibilityLabel="Fechar detalhes"
              accessibilityHint="Fecha a janela de detalhes do jogo"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={22} color="#fff" />
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Painel flutuante (preço, lista, USB) */}
      <FloatingPanel
        totalGB={totalGB}
        quantidade={selecionados.length}
        ultrapassou={ultrapassou}
        selecionados={roms
          .filter((j) => selecionadosSet.has(j.nome))
          .map((j) => ({
            nome: j.nome,
            tamanho_gb: j.tamanho_gb,
            bandeira: formatarNome(j.nome).bandeira,
          }))}
        onPenDriveChange={setTamanhoPenDrive}
      />
    </LinearGradient>
  );
}

/* ---------------- Estilos ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111c",
    marginHorizontal: 16,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  input: { flex: 1, color: "#fff", marginLeft: 6, fontSize: 15, paddingVertical: 6 },
  statusMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e3a5f",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  statusText: { color: "#aad", fontSize: 13 },
  errorMessage: { backgroundColor: "#3a1e1e" },
  errorText: { color: "#ff6b6b", fontSize: 13, marginLeft: 6 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111c",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 6,
    padding: 8,
  },
  capa: { width: 60, height: 80, borderRadius: 6, marginRight: 10 },
  semCapa: { backgroundColor: "#222", justifyContent: "center", alignItems: "center" },
  infoBox: { flex: 1 },
  nomeBox: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  nome: { color: "#fff", fontSize: 15, fontWeight: "500", flexShrink: 1 },
  flag: { color: "#fff", fontSize: 15 },
  tamanho: { color: "#ccc", fontSize: 13 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  olhoButton: { padding: 4 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#111c",
    paddingVertical: 8,
    alignItems: "center",
  },
  footerText: { color: "#fff", fontSize: 14 },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000c",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    alignItems: "center",
  },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalImage: { width: 200, height: 250, borderRadius: 10, marginBottom: 10 },
  modalDesc: { color: "#ccc", fontSize: 14, textAlign: "center", marginBottom: 10 },
  modalCloseBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e90ff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalCloseText: { color: "#fff", marginLeft: 6, fontSize: 15 },
});
