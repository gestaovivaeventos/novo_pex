/**
 * Página de Ranking PEX
 * Primeira página do dashboard - Exibe ranking das unidades
 */

import React, { useState, useMemo } from 'react';
import { withAuth } from '@/utils/auth';
import Head from 'next/head';
import { useSheetsData } from '@/hooks/useSheetsData';
import Card from '@/components/Card';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

function RankingContent() {
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
      <Head>
        <title>Ranking - PEX</title>
        <meta name="description" content="Ranking de Performance - Programa de Excelência (PEX)" />
      </Head>
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
          {/* Pódio Top 3 - Glassmorphism */}
          {rankingFiltrado.length >= 3 && (
            <div style={{ 
              marginBottom: '40px',
              padding: '40px 20px',
              background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.8) 0%, rgba(40, 40, 50, 0.8) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 102, 0, 0.3)',
              boxShadow: '0 8px 32px rgba(255, 102, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background decorativo sutil */}
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                background: 'radial-gradient(circle at top right, rgba(255, 102, 0, 0.05) 0%, transparent 50%)',
                pointerEvents: 'none'
              }} />

              <h2 style={{
                textAlign: 'center',
                color: '#FF6600',
                fontSize: '1.8rem',
                fontWeight: 700,
                fontFamily: 'Orbitron, Poppins, sans-serif',
                marginBottom: '50px',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                textShadow: '0 4px 12px rgba(255, 102, 0, 0.2)',
                position: 'relative',
                zIndex: 1
              }}>
                🏆 TOP 3 PERFORMANCE REDE VIVA
              </h2>

              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: '24px',
                flexWrap: 'wrap',
                position: 'relative',
                zIndex: 1
              }}>
                {/* 2º Lugar */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  order: 1
                }}>
                  <div style={{
                    width: '200px',
                    padding: '28px 24px',
                    background: 'linear-gradient(135deg, rgba(100, 120, 140, 0.3) 0%, rgba(80, 100, 120, 0.2) 100%)',
                    borderRadius: '16px 16px 0 0',
                    textAlign: 'center',
                    boxShadow: '0 8px 24px rgba(192, 192, 192, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2), inset 0 -1px 1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(192, 192, 192, 0.4)',
                    borderBottom: 'none',
                    minHeight: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backdropFilter: 'blur(20px)'
                  }}>
                    <div>
                      {/* Ícone de medalha SVG - Prata */}
                      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
                        <svg width="70" height="70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="14" r="6" fill="url(#silver-gradient)" stroke="#C0C0C0" strokeWidth="0.5"/>
                          <path d="M9 8L12 2L15 8" stroke="#C0C0C0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <text x="12" y="16.5" fontSize="6" fontWeight="bold" fill="#2a2f36" textAnchor="middle" fontFamily="Arial">2</text>
                          <defs>
                            <linearGradient id="silver-gradient" x1="12" y1="8" x2="12" y2="20">
                              <stop offset="0%" stopColor="#E8E8E8"/>
                              <stop offset="50%" stopColor="#C0C0C0"/>
                              <stop offset="100%" stopColor="#A0A0A0"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div style={{
                        color: '#F8F9FA',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        fontFamily: 'Poppins, sans-serif',
                        marginBottom: '6px',
                        lineHeight: '1.3'
                      }}>
                        {rankingFiltrado[1].unidade}
                      </div>
                      <div style={{
                        color: '#B0B8C0',
                        fontSize: '0.85rem',
                        fontFamily: 'Poppins, sans-serif',
                        marginBottom: '4px'
                      }}>
                        {rankingFiltrado[1].cluster || '-'}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    width: '200px',
                    height: '80px',
                    background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.4) 0%, rgba(160, 160, 160, 0.3) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.4rem',
                    color: '#F8F9FA',
                    fontFamily: 'Orbitron, sans-serif',
                    boxShadow: '0 6px 20px rgba(192, 192, 192, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(192, 192, 192, 0.4)',
                    borderTop: 'none',
                    backdropFilter: 'blur(20px)'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: '#B0B8C0', marginBottom: '4px' }}>2º Lugar</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                      {rankingFiltrado[1].media.toFixed(2)}
                    </div>
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
                    position: 'absolute',
                    top: '-20px',
                    fontSize: '2.5rem'
                  }}>
                    👑
                  </div>
                  <div style={{
                    width: '240px',
                    padding: '32px 28px',
                    background: 'linear-gradient(135deg, rgba(255, 150, 80, 0.35) 0%, rgba(255, 102, 0, 0.25) 100%)',
                    borderRadius: '16px 16px 0 0',
                    textAlign: 'center',
                    boxShadow: '0 12px 32px rgba(255, 102, 0, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.25), inset 0 -1px 1px rgba(0, 0, 0, 0.1)',
                    border: '1.5px solid rgba(255, 150, 80, 0.5)',
                    borderBottom: 'none',
                    minHeight: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backdropFilter: 'blur(20px)',
                    position: 'relative'
                  }}>
                    <div style={{ marginTop: '30px' }}>
                      {/* Ícone de medalha SVG - Ouro */}
                      <div style={{ fontSize: '4rem', marginBottom: '12px' }}>
                        <svg width="90" height="90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="14" r="6" fill="url(#gold-gradient)" stroke="#FFD700" strokeWidth="0.5"/>
                          <path d="M9 8L12 2L15 8" stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <text x="12" y="16.5" fontSize="6" fontWeight="bold" fill="#1a1d23" textAnchor="middle" fontFamily="Arial">1</text>
                          <defs>
                            <linearGradient id="gold-gradient" x1="12" y1="8" x2="12" y2="20">
                              <stop offset="0%" stopColor="#FFD700"/>
                              <stop offset="50%" stopColor="#FFC700"/>
                              <stop offset="100%" stopColor="#FFB700"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div style={{
                        color: '#F8F9FA',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        fontFamily: 'Poppins, sans-serif',
                        marginBottom: '8px',
                        lineHeight: '1.3'
                      }}>
                        {rankingFiltrado[0].unidade}
                      </div>
                      <div style={{
                        color: '#E0B000',
                        fontSize: '0.9rem',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                        marginBottom: '4px'
                      }}>
                        {rankingFiltrado[0].cluster || '-'}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    width: '240px',
                    height: '100px',
                    background: 'linear-gradient(135deg, rgba(255, 150, 80, 0.4) 0%, rgba(255, 102, 0, 0.3) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.6rem',
                    color: '#F8F9FA',
                    fontFamily: 'Orbitron, sans-serif',
                    boxShadow: '0 8px 24px rgba(255, 102, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                    border: '1.5px solid rgba(255, 150, 80, 0.5)',
                    borderTop: 'none',
                    backdropFilter: 'blur(20px)'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#FFB800', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>1º Lugar</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900 }}>
                      {rankingFiltrado[0].media.toFixed(2)}
                    </div>
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
                    width: '200px',
                    padding: '28px 24px',
                    background: 'linear-gradient(135deg, rgba(140, 100, 60, 0.3) 0%, rgba(120, 80, 50, 0.2) 100%)',
                    borderRadius: '16px 16px 0 0',
                    textAlign: 'center',
                    boxShadow: '0 8px 24px rgba(205, 127, 50, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2), inset 0 -1px 1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(205, 127, 50, 0.4)',
                    borderBottom: 'none',
                    minHeight: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backdropFilter: 'blur(20px)'
                  }}>
                    <div>
                      {/* Ícone de medalha SVG - Bronze */}
                      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
                        <svg width="70" height="70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="14" r="6" fill="url(#bronze-gradient)" stroke="#CD7F32" strokeWidth="0.5"/>
                          <path d="M9 8L12 2L15 8" stroke="#CD7F32" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <text x="12" y="16.5" fontSize="6" fontWeight="bold" fill="#2a2f36" textAnchor="middle" fontFamily="Arial">3</text>
                          <defs>
                            <linearGradient id="bronze-gradient" x1="12" y1="8" x2="12" y2="20">
                              <stop offset="0%" stopColor="#E8A875"/>
                              <stop offset="50%" stopColor="#CD7F32"/>
                              <stop offset="100%" stopColor="#B8722C"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div style={{
                        color: '#F8F9FA',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        fontFamily: 'Poppins, sans-serif',
                        marginBottom: '6px',
                        lineHeight: '1.3'
                      }}>
                        {rankingFiltrado[2].unidade}
                      </div>
                      <div style={{
                        color: '#D4A574',
                        fontSize: '0.85rem',
                        fontFamily: 'Poppins, sans-serif',
                        marginBottom: '4px'
                      }}>
                        {rankingFiltrado[2].cluster || '-'}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    width: '200px',
                    height: '80px',
                    background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.4) 0%, rgba(180, 100, 40, 0.3) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.4rem',
                    color: '#F8F9FA',
                    fontFamily: 'Orbitron, sans-serif',
                    boxShadow: '0 6px 20px rgba(205, 127, 50, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(205, 127, 50, 0.4)',
                    borderTop: 'none',
                    backdropFilter: 'blur(20px)'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: '#D4A574', marginBottom: '4px' }}>3º Lugar</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                      {rankingFiltrado[2].media.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabela de Ranking Top 10 */}
          <h2 
            className="text-2xl font-bold mb-4" 
            style={{ 
              color: '#adb5bd', 
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '2px solid #FF6600',
              paddingBottom: '12px'
            }}
          >
            Ranking Top 10 Performance Rede Viva
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
                  {rankingFiltrado.slice(0, 10).map((item, index) => (
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

          {/* Top 3 por Cluster */}
          <h2 
            className="text-2xl font-bold mb-6 mt-12" 
            style={{ 
              color: '#adb5bd', 
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '2px solid #FF6600',
              paddingBottom: '12px'
            }}
          >
            Top 3 Por Cluster
          </h2>

          {/* Grid com 4 tabelas */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {/* CALOURO INICIANTE */}
            <Card>
              <h3 style={{
                color: '#adb5bd',
                fontSize: '1.1rem',
                fontWeight: 700,
                fontFamily: 'Poppins, sans-serif',
                marginBottom: '16px',
                textTransform: 'uppercase',
                textAlign: 'center',
                borderBottom: '1px solid #FF6600',
                paddingBottom: '8px'
              }}>
                Calouro Iniciante
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #FF6600' }}>
                      <th style={{ 
                        padding: '10px 8px', 
                        textAlign: 'center', 
                        color: '#FF6600',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        Pos.
                      </th>
                      <th style={{ 
                        padding: '10px 8px', 
                        textAlign: 'center', 
                        color: '#FF6600',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        Unidade
                      </th>
                      <th style={{ 
                        padding: '10px 8px', 
                        textAlign: 'center', 
                        color: '#FF6600',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        Média
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingGeral
                      .filter(item => item.cluster === 'CALOURO INICIANTE')
                      .slice(0, 3)
                      .map((item, index) => (
                        <tr 
                          key={item.unidade}
                          style={{ 
                            borderBottom: '1px solid #343A40',
                            backgroundColor: index % 2 === 0 ? '#2a2f36' : '#23272d'
                          }}
                        >
                          <td style={{ 
                            padding: '10px 8px',
                            textAlign: 'center',
                            color: '#F8F9FA',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '1rem',
                            fontWeight: 600
                          }}>
                            {index === 0 && '🥇 '}
                            {index === 1 && '🥈 '}
                            {index === 2 && '🥉 '}
                            {index + 1}º
                          </td>
                          <td style={{ 
                            padding: '10px 8px',
                            textAlign: 'center',
                            color: '#F8F9FA',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.9rem',
                            fontWeight: index === 0 ? 600 : 400
                          }}>
                            {item.unidade}
                          </td>
                          <td style={{ 
                            padding: '10px 8px',
                            textAlign: 'center',
                            color: '#FF6600',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '1rem',
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

            {/* CALOURO */}
            <Card>
              <h3 style={{
                color: '#adb5bd',
                fontSize: '1.1rem',
                fontWeight: 700,
                fontFamily: 'Poppins, sans-serif',
                marginBottom: '16px',
                textTransform: 'uppercase',
                textAlign: 'center',
                borderBottom: '1px solid #FF6600',
                paddingBottom: '8px'
              }}>
                Calouro
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #FF6600' }}>
                      <th style={{ 
                        padding: '10px 8px', 
                        textAlign: 'center', 
                        color: '#FF6600',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        Pos.
                      </th>
                      <th style={{ 
                        padding: '10px 8px', 
                        textAlign: 'center', 
                        color: '#FF6600',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        Unidade
                      </th>
                      <th style={{ 
                        padding: '10px 8px', 
                        textAlign: 'center', 
                        color: '#FF6600',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        Média
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingGeral
                      .filter(item => item.cluster === 'CALOURO')
                      .slice(0, 3)
                      .map((item, index) => (
                        <tr 
                          key={item.unidade}
                          style={{ 
                            borderBottom: '1px solid #343A40',
                            backgroundColor: index % 2 === 0 ? '#2a2f36' : '#23272d'
                          }}
                        >
                          <td style={{ 
                            padding: '10px 8px',
                            textAlign: 'center',
                            color: '#F8F9FA',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '1rem',
                            fontWeight: 600
                          }}>
                            {index === 0 && '🥇 '}
                            {index === 1 && '🥈 '}
                            {index === 2 && '🥉 '}
                            {index + 1}º
                          </td>
                          <td style={{ 
                            padding: '10px 8px',
                            textAlign: 'center',
                            color: '#F8F9FA',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.9rem',
                            fontWeight: index === 0 ? 600 : 400
                          }}>
                            {item.unidade}
                          </td>
                          <td style={{ 
                            padding: '10px 8px',
                            textAlign: 'center',
                            color: '#FF6600',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '1rem',
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

            {/* GRADUADO */}
            <Card>
              <h3 style={{
                color: '#adb5bd',
                fontSize: '1.1rem',
                fontWeight: 700,
                fontFamily: 'Poppins, sans-serif',
                marginBottom: '16px',
                textTransform: 'uppercase',
                textAlign: 'center',
                borderBottom: '1px solid #FF6600',
                paddingBottom: '8px'
              }}>
                Graduado
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #FF6600' }}>
                      <th style={{ 
                        padding: '10px 8px', 
                        textAlign: 'center', 
                        color: '#FF6600',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        Pos.
                      </th>
                      <th style={{ 
                        padding: '10px 8px', 
                        textAlign: 'center', 
                        color: '#FF6600',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        Unidade
                      </th>
                      <th style={{ 
                        padding: '10px 8px', 
                        textAlign: 'center', 
                        color: '#FF6600',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        Média
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingGeral
                      .filter(item => item.cluster === 'GRADUADO')
                      .slice(0, 3)
                      .map((item, index) => (
                        <tr 
                          key={item.unidade}
                          style={{ 
                            borderBottom: '1px solid #343A40',
                            backgroundColor: index % 2 === 0 ? '#2a2f36' : '#23272d'
                          }}
                        >
                          <td style={{ 
                            padding: '10px 8px',
                            textAlign: 'center',
                            color: '#F8F9FA',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '1rem',
                            fontWeight: 600
                          }}>
                            {index === 0 && '🥇 '}
                            {index === 1 && '🥈 '}
                            {index === 2 && '🥉 '}
                            {index + 1}º
                          </td>
                          <td style={{ 
                            padding: '10px 8px',
                            textAlign: 'center',
                            color: '#F8F9FA',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.9rem',
                            fontWeight: index === 0 ? 600 : 400
                          }}>
                            {item.unidade}
                          </td>
                          <td style={{ 
                            padding: '10px 8px',
                            textAlign: 'center',
                            color: '#FF6600',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '1rem',
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

            {/* PÓS GRADUADO */}
            <Card>
              <h3 style={{
                color: '#adb5bd',
                fontSize: '1.1rem',
                fontWeight: 700,
                fontFamily: 'Poppins, sans-serif',
                marginBottom: '16px',
                textTransform: 'uppercase',
                textAlign: 'center',
                borderBottom: '1px solid #FF6600',
                paddingBottom: '8px'
              }}>
                Pós Graduado
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #FF6600' }}>
                      <th style={{ 
                        padding: '10px 8px', 
                        textAlign: 'center', 
                        color: '#FF6600',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        Pos.
                      </th>
                      <th style={{ 
                        padding: '10px 8px', 
                        textAlign: 'center', 
                        color: '#FF6600',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        Unidade
                      </th>
                      <th style={{ 
                        padding: '10px 8px', 
                        textAlign: 'center', 
                        color: '#FF6600',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        Média
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingGeral
                      .filter(item => item.cluster === 'PÓS GRADUADO')
                      .slice(0, 3)
                      .map((item, index) => (
                        <tr 
                          key={item.unidade}
                          style={{ 
                            borderBottom: '1px solid #343A40',
                            backgroundColor: index % 2 === 0 ? '#2a2f36' : '#23272d'
                          }}
                        >
                          <td style={{ 
                            padding: '10px 8px',
                            textAlign: 'center',
                            color: '#F8F9FA',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '1rem',
                            fontWeight: 600
                          }}>
                            {index === 0 && '🥇 '}
                            {index === 1 && '🥈 '}
                            {index === 2 && '🥉 '}
                            {index + 1}º
                          </td>
                          <td style={{ 
                            padding: '10px 8px',
                            textAlign: 'center',
                            color: '#F8F9FA',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '0.9rem',
                            fontWeight: index === 0 ? 600 : 400
                          }}>
                            {item.unidade}
                          </td>
                          <td style={{ 
                            padding: '10px 8px',
                            textAlign: 'center',
                            color: '#FF6600',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '1rem',
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
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default withAuth(RankingContent);
