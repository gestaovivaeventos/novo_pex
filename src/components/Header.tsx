/**
 * Componente de Header
 * Barra de navegação principal do dashboard - Padrão Viva Eventos
 */

import React from 'react';
import Image from 'next/image';

export default function Header() {
  return (
    <div style={{ backgroundColor: '#212529' }}>
      <div className="container mx-auto px-4 py-6">
        <div 
          style={{
            backgroundColor: '#343A40',
            padding: '20px 30px',
            borderRadius: '8px',
            boxShadow: '0 4px 10px rgba(255,102,0,0.12)',
            borderBottom: '3px solid #FF6600'
          }}
        >
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
            
            <div className="border-l border-gray-600 pl-6 h-16 flex flex-col justify-center">
              <h1 style={{ 
                fontSize: '1.75rem',
                fontWeight: 700,
                background: 'linear-gradient(to bottom, #F8F9FA 0%, #ADB5BD 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: "'Orbitron', 'Poppins', sans-serif",
                letterSpacing: '0.05em',
                marginBottom: '4px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                textTransform: 'uppercase'
              }}>
                PEX - Programa de Excelência Rede Viva
              </h1>
              <span className="text-xs" style={{ color: '#adb5bd', fontFamily: 'Poppins, sans-serif' }}>
                Ciclo {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
