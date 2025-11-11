/**
 * Hook React para buscar dados do Google Sheets
 * Exemplo de uso do endpoint /api/sheets
 */

import { useState, useEffect } from 'react';

interface FranquiaRaw {
  [key: string]: string;
}

interface MetaRaw {
  [key: string]: string;
}

interface SheetsData {
  franquias: any[][];
  metas: any[][];
}

interface UseSheetsDataReturn {
  franquias: FranquiaRaw[];
  metas: MetaRaw[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar e processar dados do Google Sheets
 */
export function useSheetsData(): UseSheetsDataReturn {
  const [franquias, setFranquias] = useState<FranquiaRaw[]>([]);
  const [metas, setMetas] = useState<MetaRaw[]>([]);
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

      const data: SheetsData = await response.json();

      // Processar dados de franquias
      // Assume que a primeira linha são os headers
      const franquiasProcessadas = processarDados(data.franquias);
      setFranquias(franquiasProcessadas);

      // Processar dados de metas
      const metasProcessadas = processarDados(data.metas);
      setMetas(metasProcessadas);

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
    franquias,
    metas,
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
  const { franquias, metas, loading, error, refetch } = useSheetsData();

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
        <h2>Franquias ({franquias.length})</h2>
        <ul>
          {franquias.map((f, i) => (
            <li key={i}>
              {f.Nome} - Cluster: {f.Cluster}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Metas por Cluster</h2>
        <ul>
          {metas.map((m, i) => (
            <li key={i}>
              {m.Cluster} - {m.Indicador}: {m.Meta}
            </li>
          ))}
        </ul>
      </section>

      <button onClick={refetch}>Atualizar Dados</button>
    </div>
  );
}
*/
