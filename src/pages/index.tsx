/**
 * Página Principal - Dashboard PEX com Filtros
 * Exibe gráfico de pontuação por Onda e Unidade
 */

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { useSheetsData } from '@/hooks/useSheetsData';
import Card from '@/components/Card';
import Header from '@/components/Header';

export default function HomePage() {
  // Buscar dados do Google Sheets
  const { dados: dadosBrutos, loading, error } = useSheetsData();

  // Estados para os filtros
  const [filtroOnda, setFiltroOnda] = useState<string>('');
  const [filtroUnidade, setFiltroUnidade] = useState<string>('');

  // Lógica de Filtros usando useMemo para performance
  const listaOndas = useMemo(() => {
    if (!dadosBrutos || dadosBrutos.length === 0) return [];
    
    // DEBUG: Ver estrutura dos dados
    console.log('📊 Dados brutos:', dadosBrutos[0]);
    console.log('📊 Total de registros:', dadosBrutos.length);
    console.log('📊 TODAS AS COLUNAS DISPONÍVEIS:', Object.keys(dadosBrutos[0]));
    
    // Extrair valores únicos da coluna 'ONDA' (Coluna V)
    const ondas = dadosBrutos
      .map(item => item.ONDA)
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    
    console.log('📊 Ondas encontradas:', ondas);
    
    return ondas;
  }, [dadosBrutos]);

  const listaUnidadesFiltradas = useMemo(() => {
    if (!dadosBrutos || dadosBrutos.length === 0) return [];
    if (!filtroOnda) return [];

    console.log('🔍 Filtro Onda selecionado:', filtroOnda);
    
    // Filtrar unidades que correspondem à onda selecionada
    const dadosFiltrados = dadosBrutos.filter(item => item.ONDA === filtroOnda);
    console.log('🔍 Registros com essa onda:', dadosFiltrados.length);
    
    const unidades = dadosFiltrados
      .map(item => item.nm_unidade)
      .filter(Boolean)
      .sort();

    console.log('🔍 Unidades encontradas:', unidades);

    return unidades;
  }, [dadosBrutos, filtroOnda]);

  const itemSelecionado = useMemo(() => {
    if (!dadosBrutos || !filtroOnda || !filtroUnidade) return null;

    // Encontrar o item que corresponde aos dois filtros
    return dadosBrutos.find(
      item =>
        item.ONDA === filtroOnda &&
        item.nm_unidade === filtroUnidade
    );
  }, [dadosBrutos, filtroOnda, filtroUnidade]);

  // Extrair pontuação (Coluna F - Pontuação com bonus)
  const pontuacao = useMemo(() => {
    if (!itemSelecionado) return 0;
    
    const valor = itemSelecionado['Pontuação com bonus'] || 
                  itemSelecionado['Pontuação com Bonus'] ||
                  itemSelecionado['Pontuação com Bônus'] ||
                  '0';
    
    return parseFloat(valor.toString().replace(',', '.')) || 0;
  }, [itemSelecionado]);

  // Calcular ranking na rede (posição geral na onda)
  const rankingRede = useMemo(() => {
    if (!dadosBrutos || !filtroOnda || !itemSelecionado) return { posicao: 0, total: 0 };

    // Filtrar apenas unidades da onda selecionada
    const unidadesDaOnda = dadosBrutos.filter(item => item.ONDA === filtroOnda);
    
    // Ordenar por pontuação (decrescente)
    const ranking = unidadesDaOnda
      .map(item => ({
        unidade: item.nm_unidade,
        pontuacao: parseFloat((item['Pontuação com bonus'] || item['Pontuação com Bonus'] || '0').toString().replace(',', '.')) || 0
      }))
      .sort((a, b) => b.pontuacao - a.pontuacao);

    // Encontrar posição da unidade selecionada
    const posicao = ranking.findIndex(item => item.unidade === filtroUnidade) + 1;

    return { posicao, total: ranking.length };
  }, [dadosBrutos, filtroOnda, filtroUnidade, itemSelecionado]);

  // Calcular ranking no cluster (posição dentro do cluster na onda)
  const rankingCluster = useMemo(() => {
    if (!dadosBrutos || !filtroOnda || !itemSelecionado || !itemSelecionado.cluster) {
      return { posicao: 0, total: 0 };
    }

    // Filtrar unidades da mesma onda E mesmo cluster
    const unidadesDoCluster = dadosBrutos.filter(
      item => item.ONDA === filtroOnda && item.cluster === itemSelecionado.cluster
    );

    // Ordenar por pontuação (decrescente)
    const ranking = unidadesDoCluster
      .map(item => ({
        unidade: item.nm_unidade,
        pontuacao: parseFloat((item['Pontuação com bonus'] || item['Pontuação com Bonus'] || '0').toString().replace(',', '.')) || 0
      }))
      .sort((a, b) => b.pontuacao - a.pontuacao);

    // Encontrar posição da unidade selecionada
    const posicao = ranking.findIndex(item => item.unidade === filtroUnidade) + 1;

    return { posicao, total: ranking.length };
  }, [dadosBrutos, filtroOnda, filtroUnidade, itemSelecionado]);

  // Dados para o gráfico de rosca (Gauge)
  const dadosGrafico = [
    { name: 'score', value: pontuacao },
    { name: 'restante', value: Math.max(0, 100 - pontuacao) }
  ];

  // Calcular pontuação média por onda (para os 4 gráficos)
  const pontuacoesPorOnda = useMemo(() => {
    if (!dadosBrutos || dadosBrutos.length === 0) return [];

    // Agrupar por onda e calcular média
    const ondas = ['1', '2', '3', '4']; // Assumindo 4 ondas
    
    return ondas.map(onda => {
      const unidadesDaOnda = dadosBrutos.filter(item => item.ONDA === onda);
      
      if (unidadesDaOnda.length === 0) {
        return { onda, media: 0, total: 0 };
      }

      const somaTotal = unidadesDaOnda.reduce((acc, item) => {
        const pontos = parseFloat((item['Pontuação com bonus'] || item['Pontuação com Bonus'] || '0').toString().replace(',', '.')) || 0;
        return acc + pontos;
      }, 0);

      const media = somaTotal / unidadesDaOnda.length;

      return {
        onda,
        media: Math.round(media * 100) / 100,
        total: unidadesDaOnda.length
      };
    });
  }, [dadosBrutos]);

  // Inicializar filtros quando os dados carregarem
  React.useEffect(() => {
    if (listaOndas.length > 0 && !filtroOnda) {
      setFiltroOnda(listaOndas[0]);
    }
  }, [listaOndas, filtroOnda]);

  React.useEffect(() => {
    if (listaUnidadesFiltradas.length > 0 && !filtroUnidade) {
      setFiltroUnidade(listaUnidadesFiltradas[0]);
    }
  }, [listaUnidadesFiltradas, filtroUnidade]);

  // Estado de Loading
  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#212529' }}>
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto" style={{ borderColor: '#FF6600' }}></div>
            <p className="mt-4 text-lg" style={{ color: '#adb5bd' }}>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado de Erro
  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#212529' }}>
        <Header />
        <div className="flex items-center justify-center h-96">
          <Card className="max-w-md">
            <div className="text-center">
              <div className="text-5xl mb-4" style={{ color: '#FF6600' }}>⚠️</div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#F8F9FA' }}>
                Erro ao carregar dados
              </h2>
              <p style={{ color: '#adb5bd' }}>{error}</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#212529' }}>
      {/* Header */}
      <Header usuario="Administrador" />

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="flex gap-4 p-4 mb-6 rounded-lg shadow" style={{ backgroundColor: '#343A40' }}>
          {/* Filtro de Onda */}
          <div className="flex-1">
            <label
              htmlFor="filtro-onda"
              className="block text-sm font-medium mb-2"
              style={{ color: '#adb5bd' }}
            >
              Selecione a Onda
            </label>
            <select
              id="filtro-onda"
              value={filtroOnda}
              onChange={(e) => {
                setFiltroOnda(e.target.value);
                setFiltroUnidade(''); // Reset unidade quando mudar onda
              }}
              className="input-field"
            >
              <option value="">Selecione...</option>
              {listaOndas.map((onda) => (
                <option key={onda} value={onda}>
                  Onda {onda}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Unidade */}
          <div className="flex-1">
            <label
              htmlFor="filtro-unidade"
              className="block text-sm font-medium mb-2"
              style={{ color: '#adb5bd' }}
            >
              Selecione a Unidade
            </label>
            <select
              id="filtro-unidade"
              value={filtroUnidade}
              onChange={(e) => setFiltroUnidade(e.target.value)}
              className="input-field"
              disabled={!filtroOnda || listaUnidadesFiltradas.length === 0}
            >
              <option value="">Selecione...</option>
              {listaUnidadesFiltradas.map((unidade) => (
                <option key={unidade} value={unidade}>
                  {unidade}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Gráfico de Pontuação */}
        {itemSelecionado ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card do Gráfico */}
            <Card titulo="Pontuação Total">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <defs>
                    <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ff7a33" stopOpacity={1} />
                      <stop offset="50%" stopColor="#ff6000" stopOpacity={1} />
                      <stop offset="100%" stopColor="#cc4d00" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={dadosGrafico}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                    strokeWidth={0}
                  >
                    {/* Gradiente radial laranja escuro para score, cinza escuro para restante */}
                    <Cell fill="url(#orangeGradient)" stroke="none" />
                    <Cell fill="#3a3f47" stroke="none" />
                    
                    {/* Label no centro mostrando a pontuação */}
                    <Label
                      value={pontuacao.toFixed(2)}
                      position="center"
                      style={{ 
                        fontSize: '2.8rem', 
                        fontWeight: '300',
                        fill: '#F8F9FA',
                        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                        letterSpacing: '-0.02em'
                      }}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="text-center mt-4">
                <p className="text-sm" style={{ color: '#adb5bd' }}>
                  Pontuação de <strong style={{ color: '#F8F9FA' }}>{filtroUnidade}</strong> na{' '}
                  <strong style={{ color: '#F8F9FA' }}>Onda {filtroOnda}</strong>
                </p>
                <div className="flex justify-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(180deg, #ff7a33, #cc4d00)' }}></div>
                    <span className="text-xs" style={{ color: '#adb5bd' }}>
                      Atingido: {pontuacao.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#3a3f47' }}></div>
                    <span className="text-xs" style={{ color: '#adb5bd' }}>
                      Restante: {(100 - pontuacao).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Card de Detalhes */}
            <Card titulo="Detalhes da Unidade">
              <div className="space-y-3">
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #555' }}>
                  <span style={{ color: '#adb5bd' }}>Unidade:</span>
                  <span className="font-semibold" style={{ color: '#F8F9FA' }}>{filtroUnidade}</span>
                </div>
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #555' }}>
                  <span style={{ color: '#adb5bd' }}>Onda:</span>
                  <span className="font-semibold" style={{ color: '#F8F9FA' }}>{filtroOnda}</span>
                </div>
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #555' }}>
                  <span style={{ color: '#adb5bd' }}>Pontuação Total:</span>
                  <span className="font-semibold" style={{ color: '#FF6600', fontSize: '1.1rem' }}>
                    {pontuacao.toFixed(2)}
                  </span>
                </div>
                
                {/* Ranking na Rede */}
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #555' }}>
                  <span style={{ color: '#adb5bd' }}>Posição na Rede:</span>
                  <span className="font-semibold" style={{ color: '#F8F9FA' }}>
                    {rankingRede.posicao}º de {rankingRede.total}
                  </span>
                </div>

                {itemSelecionado.cluster && (
                  <>
                    <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #555' }}>
                      <span style={{ color: '#adb5bd' }}>Cluster:</span>
                      <span className="font-semibold" style={{ color: '#F8F9FA' }}>
                        {itemSelecionado.cluster}
                      </span>
                    </div>
                    
                    {/* Ranking no Cluster */}
                    <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #555' }}>
                      <span style={{ color: '#adb5bd' }}>Posição no Cluster:</span>
                      <span className="font-semibold" style={{ color: '#F8F9FA' }}>
                        {rankingCluster.posicao}º de {rankingCluster.total}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4" style={{ color: '#555' }}>📊</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#F8F9FA' }}>
                Selecione uma Onda e Unidade
              </h3>
              <p style={{ color: '#adb5bd' }}>
                Use os filtros acima para visualizar a pontuação
              </p>
            </div>
          </Card>
        )}

        {/* Gráficos de Pontuação por Onda */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6" style={{ 
            color: '#adb5bd', 
            fontFamily: 'Poppins, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderBottom: '2px solid #FF6600',
            paddingBottom: '8px'
          }}>
            Pontuação Média por Onda
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pontuacoesPorOnda.map((ondaData) => {
              const dadosGraficoOnda = [
                { name: 'score', value: ondaData.media },
                { name: 'restante', value: Math.max(0, 100 - ondaData.media) }
              ];

              return (
                <Card key={ondaData.onda} titulo={`Onda ${ondaData.onda}`}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <defs>
                        <radialGradient id={`orangeGradient${ondaData.onda}`}>
                          <stop offset="0%" stopColor="#ff7a33" stopOpacity={1} />
                          <stop offset="100%" stopColor="#cc4400" stopOpacity={1} />
                        </radialGradient>
                      </defs>
                      <Pie
                        data={dadosGraficoOnda}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                        strokeWidth={0}
                      >
                        <Cell fill={`url(#orangeGradient${ondaData.onda})`} stroke="none" />
                        <Cell fill="#3a3f47" stroke="none" />
                        
                        <Label
                          value={ondaData.media.toFixed(2)}
                          position="center"
                          style={{ 
                            fontSize: '2.2rem', 
                            fontWeight: '300',
                            fill: '#F8F9FA',
                            fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                            letterSpacing: '-0.02em'
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="text-center mt-3">
                    <p className="text-sm" style={{ color: '#adb5bd', fontFamily: 'Poppins, sans-serif' }}>
                      Pontuação Média
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#6c757d', fontFamily: 'Poppins, sans-serif' }}>
                      {ondaData.total} unidades
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
