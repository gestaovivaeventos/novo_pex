/**
 * Componente de Header
 * Barra de navegação principal do dashboard - Padrão Viva Eventos
 */

import React from 'react';
import Image from 'next/image';

interface HeaderProps {
  usuario?: string;
}

export default function Header({ usuario }: HeaderProps) {
  return (
    <header style={{
      backgroundColor: '#343A40',
      boxShadow: '0 4px 10px rgba(255,102,0,0.12)',
      borderBottom: '3px solid #FF6600'
    }}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            {/* Logo Viva Eventos - Arquivo PNG original */}
            <div style={{ position: 'relative', width: '180px', height: '60px' }}>
              <Image 
                src="/logo_viva.png" 
                alt="Viva Eventos" 
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            
            <div className="border-l border-gray-600 pl-6 h-12 flex flex-col justify-center">
              <h1 className="text-xl font-bold" style={{ color: '#F8F9FA', fontFamily: 'Poppins, sans-serif' }}>
                PEX Dashboard 2026
              </h1>
              <span className="text-xs" style={{ color: '#adb5bd', fontFamily: 'Poppins, sans-serif' }}>
                Programa de Excelência
              </span>
            </div>
          </div>
          
          {usuario && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-sm block" style={{ color: '#adb5bd', fontFamily: 'Poppins, sans-serif' }}>
                  Olá,
                </span>
                <span className="text-sm font-semibold" style={{ color: '#F8F9FA', fontFamily: 'Poppins, sans-serif' }}>
                  {usuario}
                </span>
              </div>
              <button 
                className="btn-primary"
                style={{
                  padding: '8px 20px',
                  fontSize: '0.9rem',
                  borderRadius: '6px'
                }}
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
