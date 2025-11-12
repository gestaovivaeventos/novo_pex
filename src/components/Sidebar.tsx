/**
 * Sidebar - Componente de filtros lateral recolhível
 */

import React, { useState } from 'react';

interface SidebarProps {
  ondas: string[];
  unidades: string[];
  clusters: string[];
  consultores: string[];
  ondaSelecionada: string;
  unidadeSelecionada: string;
  clusterSelecionado: string;
  consultorSelecionado: string;
  onOndaChange: (onda: string) => void;
  onUnidadeChange: (unidade: string) => void;
  onClusterChange: (cluster: string) => void;
  onConsultorChange: (consultor: string) => void;
  onCollapseChange: (collapsed: boolean) => void;
}

export default function Sidebar({
  ondas,
  unidades,
  clusters,
  consultores,
  ondaSelecionada,
  unidadeSelecionada,
  clusterSelecionado,
  consultorSelecionado,
  onOndaChange,
  onUnidadeChange,
  onClusterChange,
  onConsultorChange,
  onCollapseChange
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange(newCollapsedState);
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: isCollapsed ? '0px' : '280px',
        backgroundColor: '#212529',
        borderRight: isCollapsed ? 'none' : '2px solid #343A40',
        transition: 'width 0.3s ease',
        zIndex: 100,
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Botão de Toggle - Sempre visível */}
      <button
        onClick={toggleCollapse}
        title={isCollapsed ? "Mostrar Filtros" : "Esconder Filtros"}
        style={{
          position: 'fixed',
          left: isCollapsed ? '10px' : '270px',
          top: '80px',
          width: '40px',
          height: '40px',
          background: 'linear-gradient(to bottom, #FF7A33 0%, #FF6600 50%, #E55A00 100%)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 101,
          transition: 'left 0.3s ease, transform 0.2s',
          boxShadow: '0 4px 12px rgba(255, 102, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 102, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 102, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
        }}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          style={{ 
            transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.3s ease'
          }}
        >
          <path 
            d="M9 18l6-6-6-6" 
            stroke="#000000" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Conteúdo da Sidebar */}
      {!isCollapsed && (
        <div style={{ padding: '20px', paddingTop: '70px', flex: 1 }}>
          {/* Título */}
          <div style={{ 
            marginBottom: '30px',
            paddingBottom: '15px',
            borderBottom: '2px solid #FF6600'
          }}>
            <h3 style={{ 
              color: '#FF6600',
              fontSize: '1.1rem',
              fontWeight: 600,
              margin: 0,
              fontFamily: 'Poppins, sans-serif'
            }}>
              FILTROS
            </h3>
          </div>

          {/* Filtro de Onda */}
          <div style={{ marginBottom: '25px' }}>
            <label
              style={{
                display: 'block',
                color: '#aaa',
                fontSize: '0.75rem',
                fontWeight: 500,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              📊 Período
            </label>
            <select
              value={ondaSelecionada || ''}
              onChange={(e) => onOndaChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#343A40',
                color: 'white',
                border: '1px solid #555',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FF6600';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#555';
              }}
            >
              <option value="">Todas as Ondas</option>
              {ondas.map((onda) => (
                <option key={onda} value={onda}>
                  Onda {onda}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Unidade */}
          <div style={{ marginBottom: '25px' }}>
            <label
              style={{
                display: 'block',
                color: '#aaa',
                fontSize: '0.75rem',
                fontWeight: 500,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              🏢 Unidades
            </label>
            <select
              value={unidadeSelecionada || ''}
              onChange={(e) => onUnidadeChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#343A40',
                color: 'white',
                border: '1px solid #555',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FF6600';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#555';
              }}
            >
              <option value="">Todas as Unidades</option>
              {unidades.map((unidade) => (
                <option key={unidade} value={unidade}>
                  {unidade}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Cluster */}
          <div style={{ marginBottom: '25px' }}>
            <label
              style={{
                display: 'block',
                color: '#aaa',
                fontSize: '0.75rem',
                fontWeight: 500,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              🎯 Cluster
            </label>
            <select
              value={clusterSelecionado || ''}
              onChange={(e) => onClusterChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#343A40',
                color: 'white',
                border: '1px solid #555',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FF6600';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#555';
              }}
            >
              <option value="">Todos os Clusters</option>
              {clusters.map((cluster) => (
                <option key={cluster} value={cluster}>
                  {cluster}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Consultor */}
          <div style={{ marginBottom: '25px' }}>
            <label
              style={{
                display: 'block',
                color: '#aaa',
                fontSize: '0.75rem',
                fontWeight: 500,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              👤 Consultor Responsável
            </label>
            <select
              value={consultorSelecionado || ''}
              onChange={(e) => onConsultorChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#343A40',
                color: 'white',
                border: '1px solid #555',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FF6600';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#555';
              }}
            >
              <option value="">Todos os Consultores</option>
              {consultores.map((consultor) => (
                <option key={consultor} value={consultor}>
                  {consultor}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
