/**
 * Componente de Header
 * Barra de navegação principal do dashboard
 */

import React from 'react';

interface HeaderProps {
  usuario?: string;
}

export default function Header({ usuario }: HeaderProps) {
  return (
    <header className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">PEX Dashboard 2026</h1>
            <span className="text-sm opacity-90">Programa de Excelência</span>
          </div>
          
          {usuario && (
            <div className="flex items-center space-x-2">
              <span className="text-sm">Olá, {usuario}</span>
              <button className="bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded transition-colors">
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
