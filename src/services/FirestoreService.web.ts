// src/services/FirestoreService.web.ts
import { collection, getDocs } from "firebase/firestore";
import { db } from "./FirebaseConfig";

export interface JogoPS2 {
  nome: string;
  tamanho_gb: number;
  codigos?: string[];
  descricao?: string;
  capa_url?: string;
}

// 🔥 Carrega jogos novos do Firestore
export async function getJogosNovos(): Promise<JogoPS2[]> {
  try {
    const colRef = collection(db, "jogos_novos");
    const snapshot = await getDocs(colRef);
    const data: JogoPS2[] = [];

    snapshot.forEach((doc) => {
      const jogo = doc.data() as JogoPS2;
      data.push({
        nome: jogo.nome || "Sem nome",
        tamanho_gb: jogo.tamanho_gb || 0,
        codigos: jogo.codigos || [],
        descricao: jogo.descricao || "",
        capa_url: jogo.capa_url || "",
      });
    });

    console.log(`🔥 Carregado ${data.length} jogos do Firestore`);
    return data;
  } catch (error) {
    console.error("❌ Erro ao buscar jogos do Firestore:", error);
    return [];
  }
}
