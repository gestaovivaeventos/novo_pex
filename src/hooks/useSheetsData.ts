/**
 * Hook React para buscar dados do Google Sheets
 * Busca dados da aba 'DEVERIA' (colunas A até V)
 */

import { useState, useEffect } from 'react';

interface FranquiaRaw {
  [key: string]: string;
}

interface UseSheetsDataReturn {
  dados: FranquiaRaw[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar e processar dados do Google Sheets
 * Agora busca apenas a aba 'DEVERIA'
 */
export function useSheetsData(): UseSheetsDataReturn {
  const [dados, setDados] = useState<FranquiaRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sheets');
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.statusText}`);
      }

      const rawData: any[][] = await response.json();

      console.log('🌐 API retornou dados:', rawData.length, 'linhas');
      console.log('🌐 Primeira linha (headers):', rawData[0]);
      console.log('🌐 Segunda linha (primeiro registro):', rawData[1]);

      // Processar dados da aba DEVERIA
      // Assume que a primeira linha são os headers
      const dadosProcessados = processarDados(rawData);
      console.log('✅ Dados processados:', dadosProcessados.length, 'registros');
      console.log('✅ Primeiro registro processado:', dadosProcessados[0]);
      
      setDados(dadosProcessados);

    } catch (err: any) {
      console.error('Erro ao buscar dados do Sheets:', err);
      setError(err.message || 'Erro desconhecido ao buscar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    dados,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Converte array de arrays em array de objetos
 * Primeira linha = headers, demais linhas = dados
 */
function processarDados(dados: any[][]): any[] {
  if (!dados || dados.length < 2) return [];

  const headers = dados[0]; // Primeira linha são os cabeçalhos
  const rows = dados.slice(1); // Demais linhas são os dados

  return rows.map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

// ============================================
// EXEMPLO DE USO EM UM COMPONENTE
// ============================================

/*
import { useSheetsData } from '@/hooks/useSheetsData';

export default function DashboardPage() {
  const { dados, loading, error, refetch } = useSheetsData();

  if (loading) {
    return <div>Carregando dados...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Erro: {error}</p>
        <button onClick={refetch}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard PEX</h1>
      
      <section>
        <h2>Dados da aba DEVERIA ({dados.length})</h2>
        <ul>
          {dados.map((item, i) => (
            <li key={i}>
              {item.nm_unidade} - Cluster: {item.cluster}
            </li>
          ))}
        </ul>
      </section>

      <button onClick={refetch}>Atualizar Dados</button>
    </div>
  );
}
*/

