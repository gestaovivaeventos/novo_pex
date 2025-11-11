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

  // Dados para o gráfico de rosca (Gauge)
  const dadosGrafico = [
    { name: 'score', value: pontuacao },
    { name: 'restante', value: Math.max(0, 100 - pontuacao) }
  ];

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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado de Erro
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Card className="max-w-md">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Erro ao carregar dados
              </h2>
              <p className="text-gray-600">{error}</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header usuario="Administrador" />

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="flex gap-4 p-4 mb-6 bg-white rounded-lg shadow">
          {/* Filtro de Onda */}
          <div className="flex-1">
            <label
              htmlFor="filtro-onda"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className="block text-sm font-medium text-gray-700 mb-2"
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
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={dadosGrafico}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    {/* Cor laranja para score, cinza para restante */}
                    <Cell fill="#FF6600" />
                    <Cell fill="#555" />
                    
                    {/* Label no centro mostrando a pontuação */}
                    <Label
                      value={pontuacao.toFixed(2)}
                      position="center"
                      className="text-3xl font-bold"
                      fill="#F8F9FA"
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="text-center mt-4">
                <p className="text-sm" style={{ color: '#adb5bd' }}>
                  Pontuação de <strong style={{ color: '#F8F9FA' }}>{filtroUnidade}</strong> na{' '}
                  <strong style={{ color: '#F8F9FA' }}>Onda {filtroOnda}</strong>
                </p>
                <div className="flex justify-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF6600' }}></div>
                    <span className="text-xs" style={{ color: '#adb5bd' }}>
                      Atingido: {pontuacao.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#555' }}></div>
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
                  <span className="font-semibold" style={{ color: '#FF6600' }}>
                    {pontuacao.toFixed(2)}
                  </span>
                </div>
                {itemSelecionado.cluster && (
                  <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #555' }}>
                    <span style={{ color: '#adb5bd' }}>Cluster:</span>
                    <span className="font-semibold" style={{ color: '#F8F9FA' }}>
                      {itemSelecionado.cluster}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Selecione uma Onda e Unidade
              </h3>
              <p className="text-gray-500">
                Use os filtros acima para visualizar a pontuação
              </p>
            </div>
          </Card>
        )}

        {/* Informações Adicionais */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">
                Total de Registros
              </p>
              <p className="text-3xl font-bold text-primary-600">
                {dadosBrutos.length}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">
                Ondas Disponíveis
              </p>
              <p className="text-3xl font-bold text-green-600">
                {listaOndas.length}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">
                Unidades na Onda {filtroOnda || '-'}
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {listaUnidadesFiltradas.length}
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
