/**
 * Página de Gerenciamento de Parâmetros
 * Permite configurar pesos e metas dos indicadores do PEX
 */

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Sidebar from '@/components/Sidebar';
import { useSheetsData } from '@/hooks/useSheetsData';

interface UnidadeConsultor {
  unidade: string;
  consultor: string;
}

export default function ParametrosPage() {
  const { dados: dadosBrutos } = useSheetsData();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unidadesConsultores, setUnidadesConsultores] = useState<UnidadeConsultor[]>([]);
  const [consultoresAtivos, setConsultoresAtivos] = useState<string[]>([]);
  const [alteracoes, setAlteracoes] = useState<Map<string, string>>(new Map());
  const [mensagem, setMensagem] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [pesquisaUnidade, setPesquisaUnidade] = useState<string>('');
  const [ordenacao, setOrdenacao] = useState<{ coluna: 'unidade' | 'consultor'; direcao: 'asc' | 'desc' }>({
    coluna: 'unidade',
    direcao: 'asc'
  });

  // Filtros dummy para a sidebar
  const [filtroOnda, setFiltroOnda] = useState<string>('');
  const [filtroUnidade, setFiltroUnidade] = useState<string>('');
  const [filtroCluster, setFiltroCluster] = useState<string>('');
  const [filtroConsultor, setFiltroConsultor] = useState<string>('');

  // Carregar dados da aba UNI CONS
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/consultores');
        
        if (!response.ok) {
          throw new Error('Erro ao carregar dados');
        }

        const dados = await response.json();
        
        console.log('Dados recebidos da API:', dados);
        
        if (dados.length > 0) {
          // Primeira linha: headers
          // Segunda linha em diante: dados
          const headers = dados[0];
          const rows = dados.slice(1);
          
          console.log('Headers:', headers);
          console.log('Primeiras 3 linhas:', rows.slice(0, 3));
          
          // Encontrar índice das colunas
          const unidadeIdx = headers.findIndex((h: string) => h === 'nm_unidade');
          const consultorIdx = headers.findIndex((h: string) => h === 'Consultor');
          const consultoresAtivosIdx = headers.findIndex((h: string) => h === 'Consultores ativos');
          
          console.log('Índices:', { unidadeIdx, consultorIdx, consultoresAtivosIdx });
          
          // Extrair unidades e consultores
          const unidades: UnidadeConsultor[] = rows
            .filter((row: any[]) => row[unidadeIdx])
            .map((row: any[]) => ({
              unidade: row[unidadeIdx] || '',
              consultor: row[consultorIdx] || ''
            }));
          
          // Extrair consultores ativos - procurar em todas as linhas da coluna F
          const consultoresSet = new Set<string>();
          rows.forEach((row: any[]) => {
            const consultoresCell = row[consultoresAtivosIdx];
            if (consultoresCell) {
              // Se a célula tem múltiplos consultores separados por \n
              const consultoresDaCelula = consultoresCell
                .split('\n')
                .map((c: string) => c.trim())
                .filter((c: string) => c.length > 0);
              
              consultoresDaCelula.forEach((c: string) => consultoresSet.add(c));
            }
          });
          
          const consultoresLista = Array.from(consultoresSet);
          console.log('Consultores ativos encontrados:', consultoresLista);
          
          setUnidadesConsultores(unidades);
          setConsultoresAtivos(consultoresLista);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setMensagem({ tipo: 'error', texto: 'Erro ao carregar dados da planilha' });
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Atualizar consultor localmente
  const handleConsultorChange = (unidade: string, novoConsultor: string) => {
    const novasAlteracoes = new Map(alteracoes);
    novasAlteracoes.set(unidade, novoConsultor);
    setAlteracoes(novasAlteracoes);
  };

  // Filtrar unidades pela pesquisa
  const unidadesFiltradas = unidadesConsultores.filter(uc =>
    uc.unidade.toLowerCase().includes(pesquisaUnidade.toLowerCase())
  );

  // Ordenar unidades
  const unidadesOrdenadas = [...unidadesFiltradas].sort((a, b) => {
    let valorA: string;
    let valorB: string;

    if (ordenacao.coluna === 'unidade') {
      valorA = a.unidade;
      valorB = b.unidade;
    } else {
      valorA = alteracoes.get(a.unidade) || a.consultor || '';
      valorB = alteracoes.get(b.unidade) || b.consultor || '';
    }

    const comparacao = valorA.localeCompare(valorB);
    return ordenacao.direcao === 'asc' ? comparacao : -comparacao;
  });

  // Função para alternar ordenação
  const toggleOrdenacao = (coluna: 'unidade' | 'consultor') => {
    if (ordenacao.coluna === coluna) {
      setOrdenacao({
        coluna,
        direcao: ordenacao.direcao === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setOrdenacao({
        coluna,
        direcao: 'asc'
      });
    }
  };

  // Salvar alterações
  const salvarAlteracoes = async () => {
    if (alteracoes.size === 0) {
      setMensagem({ tipo: 'error', texto: 'Nenhuma alteração para salvar' });
      return;
    }

    try {
      setSaving(true);
      setMensagem(null);

      // Salvar cada alteração
      const alteracoesArray = Array.from(alteracoes.entries());
      console.log('Salvando alterações:', alteracoesArray);
      
      for (let i = 0; i < alteracoesArray.length; i++) {
        const [unidade, consultor] = alteracoesArray[i];
        console.log(`Salvando ${i + 1}/${alteracoesArray.length}:`, { unidade, consultor });
        
        const response = await fetch('/api/consultores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ unidade, consultor }),
        });

        const resultado = await response.json();
        console.log('Resposta da API:', resultado);

        if (!response.ok) {
          console.error('Erro na resposta:', resultado);
          throw new Error(resultado.message || `Erro ao atualizar ${unidade}`);
        }
      }

      // Atualizar estado local
      const novasUnidades = unidadesConsultores.map(uc => ({
        ...uc,
        consultor: alteracoes.get(uc.unidade) || uc.consultor
      }));
      setUnidadesConsultores(novasUnidades);
      setAlteracoes(new Map());
      
      setMensagem({ tipo: 'success', texto: `${alteracoes.size} consultor(es) atualizado(s) com sucesso!` });
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setMensagem({ tipo: 'error', texto: error.message || 'Erro ao salvar alterações' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#212529' }}>
      {/* Sidebar */}
      <Sidebar
        ondas={[]}
        unidades={[]}
        clusters={[]}
        consultores={[]}
        ondaSelecionada={filtroOnda}
        unidadeSelecionada={filtroUnidade}
        clusterSelecionado={filtroCluster}
        consultorSelecionado={filtroConsultor}
        onOndaChange={setFiltroOnda}
        onUnidadeChange={setFiltroUnidade}
        onClusterChange={setFiltroCluster}
        onConsultorChange={setFiltroConsultor}
        onCollapseChange={setSidebarCollapsed}
        currentPage="parametros"
      />

      {/* Área de conteúdo */}
      <div style={{
        marginLeft: sidebarCollapsed ? '0px' : '280px',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh'
      }}>
        <Header />

        <main className="container mx-auto px-4 py-4">
          <h1 
            className="text-3xl font-bold mb-6" 
            style={{ 
              color: '#adb5bd', 
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderBottom: '2px solid #FF6600',
              paddingBottom: '12px'
            }}
          >
            Gerenciamento de Consultores
          </h1>

          {/* Mensagem de feedback */}
          {mensagem && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '20px',
              borderRadius: '8px',
              backgroundColor: mensagem.tipo === 'success' ? '#22c55e20' : '#ef444420',
              border: `1px solid ${mensagem.tipo === 'success' ? '#22c55e' : '#ef4444'}`,
              color: mensagem.tipo === 'success' ? '#22c55e' : '#ef4444',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {mensagem.texto}
            </div>
          )}

          <Card>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto" style={{ borderColor: '#FF6600' }}></div>
                <p className="mt-4" style={{ color: '#adb5bd' }}>Carregando dados...</p>
              </div>
            ) : (
              <div>
                {/* Barra de pesquisa */}
                <div style={{ marginBottom: '20px', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#adb5bd',
                    pointerEvents: 'none',
                    fontSize: '1.1rem'
                  }}>
                    🔍
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquisar unidade..."
                    value={pesquisaUnidade}
                    onChange={(e) => setPesquisaUnidade(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 45px',
                      backgroundColor: '#343A40',
                      color: 'white',
                      border: '1px solid #555',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontFamily: 'Poppins, sans-serif',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FF6600'}
                    onBlur={(e) => e.target.style.borderColor = '#555'}
                  />
                  {pesquisaUnidade && (
                    <div style={{ 
                      marginTop: '8px', 
                      color: '#adb5bd', 
                      fontSize: '0.85rem',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      {unidadesOrdenadas.length} unidade(s) encontrada(s)
                    </div>
                  )}
                </div>

                {/* Cabeçalho da tabela */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  padding: '12px 16px',
                  backgroundColor: '#2a2f36',
                  borderRadius: '8px 8px 0 0',
                  fontWeight: 600,
                  color: '#FF6600',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.9rem'
                }}>
                  <div 
                    onClick={() => toggleOrdenacao('unidade')}
                    style={{ 
                      cursor: 'pointer', 
                      userSelect: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    UNIDADE
                    {ordenacao.coluna === 'unidade' && (
                      <span style={{ fontSize: '0.7rem' }}>
                        {ordenacao.direcao === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                  <div 
                    onClick={() => toggleOrdenacao('consultor')}
                    style={{ 
                      cursor: 'pointer', 
                      userSelect: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    CONSULTOR RESPONSÁVEL
                    {ordenacao.coluna === 'consultor' && (
                      <span style={{ fontSize: '0.7rem' }}>
                        {ordenacao.direcao === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Lista de unidades */}
                <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                  {unidadesOrdenadas.length === 0 ? (
                    <div style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#adb5bd',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      {pesquisaUnidade ? 'Nenhuma unidade encontrada' : 'Nenhum dado disponível'}
                    </div>
                  ) : (
                    unidadesOrdenadas.map((uc, index) => {
                      const consultorAtual = alteracoes.get(uc.unidade) || uc.consultor;
                      const foiAlterado = alteracoes.has(uc.unidade);

                      return (
                        <div 
                          key={uc.unidade}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                            padding: '12px 16px',
                            borderBottom: '1px solid #343A40',
                            backgroundColor: foiAlterado 
                              ? '#2a2f3680' 
                              : index % 2 === 0 
                                ? '#2a2f36' 
                                : '#23272d',
                            fontFamily: 'Poppins, sans-serif',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <div style={{ 
                            color: '#F8F9FA',
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: foiAlterado ? 600 : 400
                          }}>
                            {foiAlterado && <span style={{ color: '#FF6600', marginRight: '8px' }}>●</span>}
                            {uc.unidade}
                          </div>
                          <div>
                            <select
                              value={consultorAtual}
                              onChange={(e) => handleConsultorChange(uc.unidade, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                backgroundColor: '#343A40',
                                color: 'white',
                                border: foiAlterado ? '2px solid #FF6600' : '1px solid #555',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                fontFamily: 'Poppons, sans-serif',
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                            >
                              <option value="">Selecione um consultor</option>
                              {consultoresAtivos.map(consultor => (
                                <option key={consultor} value={consultor}>
                                  {consultor}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Botão de salvar */}
                <div style={{ 
                  padding: '16px',
                  borderTop: '2px solid #343A40',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ color: '#adb5bd', fontSize: '0.9rem', fontFamily: 'Poppins, sans-serif' }}>
                    {alteracoes.size > 0 ? (
                      <span style={{ color: '#FF6600', fontWeight: 600 }}>
                        {alteracoes.size} alteração(ões) pendente(s)
                      </span>
                    ) : (
                      'Nenhuma alteração pendente'
                    )}
                  </div>
                  
                  <button
                    onClick={salvarAlteracoes}
                    disabled={saving || alteracoes.size === 0}
                    style={{
                      padding: '10px 24px',
                      background: alteracoes.size > 0 && !saving
                        ? 'linear-gradient(to bottom, #22c55e 0%, #16a34a 50%, #15803d 100%)'
                        : 'linear-gradient(to bottom, #4a5563 0%, #3a4553 50%, #2a3543 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: alteracoes.size > 0 && !saving ? 'pointer' : 'not-allowed',
                      fontFamily: 'Poppins, sans-serif',
                      opacity: saving || alteracoes.size === 0 ? 0.6 : 1,
                      boxShadow: alteracoes.size > 0 && !saving
                        ? '0 4px 12px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
