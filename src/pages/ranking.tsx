/**
 * Página de Ranking PEX
 * Primeira página do dashboard - Exibe ranking das unidades
 */

import React, { useState, useMemo } from 'react';
import { useSheetsData } from '@/hooks/useSheetsData';
import Card from '@/components/Card';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function RankingPage() {
  // Buscar dados do Google Sheets
  const { dados: dadosBrutos, loading, error } = useSheetsData();

  // Estados para os filtros
  const [filtroQuarter, setFiltroQuarter] = useState<string>('');
  const [filtroUnidade, setFiltroUnidade] = useState<string>('');
  const [filtroCluster, setFiltroCluster] = useState<string>('');
  const [filtroConsultor, setFiltroConsultor] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Nome dinâmico da coluna do consultor
  const [nomeColunaConsultor, setNomeColunaConsultor] = useState<string>('Consultor');

  // Listas para os filtros
  const listaQuarters = useMemo(() => {
    if (!dadosBrutos || dadosBrutos.length === 0) return [];
    
    const quarters = dadosBrutos
      .map(item => item.QUARTER)
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    
    return quarters;
  }, [dadosBrutos]);

  const listaClusters = useMemo(() => {
    if (!dadosBrutos || dadosBrutos.length === 0) return [];
    
    const clusters = dadosBrutos
      .map(item => item.cluster)
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    
    return clusters;
  }, [dadosBrutos]);

  const listaConsultores = useMemo(() => {
    if (!dadosBrutos || dadosBrutos.length === 0) return [];
    
    const possiveisNomesConsultor = ['Consultor', 'CONSULTOR', 'consultor', 'CONSULTOR RESPONSAVEL', 'Consultor Responsável', 'Consultor Responsavel'];
    let nomeColuna = possiveisNomesConsultor.find(nome => dadosBrutos[0].hasOwnProperty(nome));
    
    if (!nomeColuna) return [];
    
    const consultores = dadosBrutos
      .map(item => item[nomeColuna])
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    
    return consultores;
  }, [dadosBrutos]);

  const listaUnidadesFiltradas = useMemo(() => {
    if (!dadosBrutos || dadosBrutos.length === 0) return [];

    let dadosFiltrados = dadosBrutos;
    
    if (filtroQuarter) {
      dadosFiltrados = dadosFiltrados.filter(item => item.QUARTER === filtroQuarter);
    }
    
    if (filtroCluster) {
      dadosFiltrados = dadosFiltrados.filter(item => item.cluster === filtroCluster);
    }
    
    if (filtroConsultor) {
      dadosFiltrados = dadosFiltrados.filter(item => item[nomeColunaConsultor] === filtroConsultor);
    }
    
    const unidades = dadosFiltrados
      .map(item => item.nm_unidade)
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();

    return unidades;
  }, [dadosBrutos, filtroQuarter, filtroCluster, filtroConsultor, nomeColunaConsultor]);

  // Calcular ranking por média de todos os quarters
  const rankingGeral = useMemo(() => {
    if (!dadosBrutos || dadosBrutos.length === 0) return [];

    // Agrupar por unidade e calcular média de todos os quarters
    const unidadesComMedia = new Map<string, { 
      soma: number; 
      count: number; 
      cluster?: string;
      consultor?: string;
    }>();

    dadosBrutos.forEach(item => {
      const unidade = item.nm_unidade;
      const pontos = parseFloat((item['Pontuação com bonus'] || item['Pontuação com Bonus'] || '0').toString().replace(',', '.')) || 0;
      
      if (!unidadesComMedia.has(unidade)) {
        unidadesComMedia.set(unidade, { 
          soma: 0, 
          count: 0, 
          cluster: item.cluster,
          consultor: item[nomeColunaConsultor]
        });
      }
      
      const dados = unidadesComMedia.get(unidade)!;
      dados.soma += pontos;
      dados.count += 1;
    });

    // Criar ranking com médias
    return Array.from(unidadesComMedia.entries())
      .map(([unidade, dados]) => ({
        unidade,
        media: dados.soma / dados.count,
        cluster: dados.cluster,
        consultor: dados.consultor
      }))
      .sort((a, b) => b.media - a.media)
      .map((item, index) => ({
        ...item,
        posicao: index + 1
      }));
  }, [dadosBrutos, nomeColunaConsultor]);

  // Aplicar filtros ao ranking
  const rankingFiltrado = useMemo(() => {
    let ranking = rankingGeral;

    if (filtroCluster) {
      ranking = ranking.filter(item => item.cluster === filtroCluster);
      // Recalcular posições após filtro
      ranking = ranking.map((item, index) => ({
        ...item,
        posicao: index + 1
      }));
    }

    if (filtroConsultor) {
      ranking = ranking.filter(item => item.consultor === filtroConsultor);
      // Recalcular posições após filtro
      ranking = ranking.map((item, index) => ({
        ...item,
        posicao: index + 1
      }));
    }

    return ranking;
  }, [rankingGeral, filtroCluster, filtroConsultor]);

  // Detectar o nome da coluna do consultor
  React.useEffect(() => {
    if (dadosBrutos && dadosBrutos.length > 0) {
      const possiveisNomesConsultor = ['Consultor', 'CONSULTOR', 'consultor', 'CONSULTOR RESPONSAVEL', 'Consultor Responsável', 'Consultor Responsavel'];
      const nomeColuna = possiveisNomesConsultor.find(nome => dadosBrutos[0].hasOwnProperty(nome));
      if (nomeColuna) {
        setNomeColunaConsultor(nomeColuna);
      }
    }
  }, [dadosBrutos]);

  // Inicializar filtros quando os dados carregarem
  React.useEffect(() => {
    if (listaQuarters.length > 0 && !filtroQuarter) {
      setFiltroQuarter(listaQuarters[0]);
    }
  }, [listaQuarters, filtroQuarter]);

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
      {/* Sidebar com Filtros */}
      <Sidebar
        quarters={listaQuarters}
        unidades={listaUnidadesFiltradas}
        clusters={listaClusters}
        consultores={listaConsultores}
        quarterSelecionado={filtroQuarter}
        unidadeSelecionada={filtroUnidade}
        clusterSelecionado={filtroCluster}
        consultorSelecionado={filtroConsultor}
        onQuarterChange={setFiltroQuarter}
        onUnidadeChange={setFiltroUnidade}
        onClusterChange={setFiltroCluster}
        onConsultorChange={setFiltroConsultor}
        onCollapseChange={setSidebarCollapsed}
        currentPage="ranking"
      />

      {/* Área de conteúdo que se ajusta à sidebar */}
      <div style={{
        marginLeft: sidebarCollapsed ? '0px' : '280px',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <Header />

        {/* Conteúdo Principal */}
        <main className="container mx-auto px-4 py-8">
          <h1 
            className="text-3xl font-bold mb-8" 
            style={{ 
              color: '#adb5bd', 
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderBottom: '2px solid #FF6600',
              paddingBottom: '12px'
            }}
          >
            Ranking Geral
            {filtroCluster && <span style={{ color: '#FF6600' }}> - {filtroCluster}</span>}
            {filtroConsultor && <span style={{ color: '#FF6600' }}> - {filtroConsultor}</span>}
          </h1>

          {/* Pódio Top 3 */}
          {rankingFiltrado.length >= 3 && (
            <div style={{ 
              marginBottom: '40px',
              padding: '40px 20px',
              background: 'linear-gradient(135deg, #1a1d23 0%, #2a2f36 100%)',
              borderRadius: '12px',
              border: '2px solid #FF6600',
              boxShadow: '0 8px 24px rgba(255, 102, 0, 0.15)'
            }}>
              <h2 style={{
                textAlign: 'center',
                color: '#FF6600',
                fontSize: '1.5rem',
                fontWeight: 700,
                fontFamily: 'Orbitron, Poppins, sans-serif',
                marginBottom: '40px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                textShadow: '0 2px 8px rgba(255, 102, 0, 0.3)'
              }}>
                🏆 Top 3 Performance Rede Viva
              </h2>

              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: '20px',
                flexWrap: 'wrap'
              }}>
                {/* 2º Lugar */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  order: 1
                }}>
                  <div style={{
                    width: '180px',
                    padding: '20px',
                    background: 'linear-gradient(to bottom, #5a6573 0%, #4a5563 50%, #3a4553 100%)',
                    borderRadius: '12px 12px 0 0',
                    textAlign: 'center',
                    boxShadow: '0 -4px 16px rgba(192, 192, 192, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
                    border: '2px solid #C0C0C0',
                    borderBottom: 'none',
                    minHeight: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🥈</div>
                      <div style={{
                        color: '#F8F9FA',
                        fontSize: '1rem',
                        fontWeight: 700,
                        fontFamily: 'Poppins, sans-serif',
                        marginBottom: '8px',
                        lineHeight: '1.3'
                      }}>
                        {rankingFiltrado[1].unidade}
                      </div>
                      <div style={{
                        color: '#C0C0C0',
                        fontSize: '0.8rem',
                        fontFamily: 'Poppins, sans-serif',
                        marginBottom: '4px'
                      }}>
                        {rankingFiltrado[1].cluster || '-'}
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(to right, rgba(192, 192, 192, 0.1), rgba(192, 192, 192, 0.3), rgba(192, 192, 192, 0.1))',
                      padding: '10px',
                      borderRadius: '8px',
                      marginTop: '12px'
                    }}>
                      <div style={{
                        color: '#C0C0C0',
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        fontFamily: 'Orbitron, sans-serif'
                      }}>
                        {rankingFiltrado[1].media.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    width: '180px',
                    height: '50px',
                    background: 'linear-gradient(to bottom, #C0C0C0 0%, #A8A8A8 50%, #909090 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    color: '#1a1d23',
                    fontFamily: 'Orbitron, sans-serif',
                    boxShadow: '0 4px 12px rgba(192, 192, 192, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                    border: '2px solid #C0C0C0',
                    borderTop: 'none'
                  }}>
                    2
                  </div>
                </div>

                {/* 1º Lugar */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  order: 2
                }}>
                  <div style={{
                    width: '200px',
                    padding: '24px',
                    background: 'linear-gradient(to bottom, #FFD700 0%, #FFC700 25%, #FFB700 50%, #FFA700 75%, #FF9700 100%)',
                    borderRadius: '12px 12px 0 0',
                    textAlign: 'center',
                    boxShadow: '0 -8px 24px rgba(255, 215, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                    border: '3px solid #FFD700',
                    borderBottom: 'none',
                    minHeight: '240px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '2rem'
                    }}>
                      👑
                    </div>
                    <div style={{ marginTop: '20px' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🥇</div>
                      <div style={{
                        color: '#1a1d23',
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        fontFamily: 'Poppins, sans-serif',
                        marginBottom: '8px',
                        lineHeight: '1.3',
                        textShadow: '0 1px 2px rgba(255, 255, 255, 0.3)'
                      }}>
                        {rankingFiltrado[0].unidade}
                      </div>
                      <div style={{
                        color: '#3a4553',
                        fontSize: '0.85rem',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                        marginBottom: '4px'
                      }}>
                        {rankingFiltrado[0].cluster || '-'}
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(to right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2))',
                      padding: '12px',
                      borderRadius: '8px',
                      marginTop: '16px',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                      <div style={{
                        color: '#1a1d23',
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        fontFamily: 'Orbitron, sans-serif',
                        textShadow: '0 1px 2px rgba(255, 255, 255, 0.3)'
                      }}>
                        {rankingFiltrado[0].media.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    width: '200px',
                    height: '60px',
                    background: 'linear-gradient(to bottom, #FFD700 0%, #FFC700 50%, #FFB700 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '2rem',
                    color: '#1a1d23',
                    fontFamily: 'Orbitron, sans-serif',
                    boxShadow: '0 6px 16px rgba(255, 215, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                    border: '3px solid #FFD700',
                    borderTop: 'none',
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.3)'
                  }}>
                    1
                  </div>
                </div>

                {/* 3º Lugar */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  order: 3
                }}>
                  <div style={{
                    width: '180px',
                    padding: '20px',
                    background: 'linear-gradient(to bottom, #CD7F32 0%, #BD6F22 50%, #AD5F12 100%)',
                    borderRadius: '12px 12px 0 0',
                    textAlign: 'center',
                    boxShadow: '0 -4px 16px rgba(205, 127, 50, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
                    border: '2px solid #CD7F32',
                    borderBottom: 'none',
                    minHeight: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🥉</div>
                      <div style={{
                        color: '#F8F9FA',
                        fontSize: '1rem',
                        fontWeight: 700,
                        fontFamily: 'Poppins, sans-serif',
                        marginBottom: '8px',
                        lineHeight: '1.3'
                      }}>
                        {rankingFiltrado[2].unidade}
                      </div>
                      <div style={{
                        color: '#FFD7B3',
                        fontSize: '0.8rem',
                        fontFamily: 'Poppins, sans-serif',
                        marginBottom: '4px'
                      }}>
                        {rankingFiltrado[2].cluster || '-'}
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(to right, rgba(255, 215, 179, 0.1), rgba(255, 215, 179, 0.3), rgba(255, 215, 179, 0.1))',
                      padding: '10px',
                      borderRadius: '8px',
                      marginTop: '12px'
                    }}>
                      <div style={{
                        color: '#FFD7B3',
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        fontFamily: 'Orbitron, sans-serif'
                      }}>
                        {rankingFiltrado[2].media.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    width: '180px',
                    height: '45px',
                    background: 'linear-gradient(to bottom, #CD7F32 0%, #BD6F22 50%, #AD5F12 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    color: '#1a1d23',
                    fontFamily: 'Orbitron, sans-serif',
                    boxShadow: '0 4px 12px rgba(205, 127, 50, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
                    border: '2px solid #CD7F32',
                    borderTop: 'none'
                  }}>
                    3
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabela de Ranking Completo */}
          <h2 
            className="text-2xl font-bold mb-4" 
            style={{ 
              color: '#adb5bd', 
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Ranking Completo
          </h2>

          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #FF6600' }}>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      color: '#FF6600',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      Posição
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      color: '#FF6600',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      Unidade
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      color: '#FF6600',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      Cluster
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      color: '#FF6600',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      Consultor
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'center', 
                      color: '#FF6600',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      Pontuação Média
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rankingFiltrado.map((item, index) => (
                    <tr 
                      key={item.unidade}
                      style={{ 
                        borderBottom: '1px solid #343A40',
                        backgroundColor: index % 2 === 0 ? '#2a2f36' : '#23272d',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <td style={{ 
                        padding: '12px',
                        color: '#F8F9FA',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '1.1rem',
                        fontWeight: 600
                      }}>
                        {item.posicao === 1 && '🥇 '}
                        {item.posicao === 2 && '🥈 '}
                        {item.posicao === 3 && '🥉 '}
                        {item.posicao}º
                      </td>
                      <td style={{ 
                        padding: '12px',
                        color: '#F8F9FA',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: item.posicao <= 3 ? 600 : 400
                      }}>
                        {item.unidade}
                      </td>
                      <td style={{ 
                        padding: '12px',
                        color: '#adb5bd',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        {item.cluster || '-'}
                      </td>
                      <td style={{ 
                        padding: '12px',
                        color: '#adb5bd',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        {item.consultor || '-'}
                      </td>
                      <td style={{ 
                        padding: '12px',
                        textAlign: 'center',
                        color: '#FF6600',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '1.1rem',
                        fontWeight: 600
                      }}>
                        {item.media.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
