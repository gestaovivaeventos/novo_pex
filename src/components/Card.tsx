/**
 * Componente de Card
 * Componente reutilizável para exibir informações em cards
 * Seguindo princípio de Modularidade da Seção 3
 */

import React from 'react';

interface CardProps {
  titulo?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ titulo, children, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {titulo && (
        <h3 className="text-xl font-bold mb-4 text-gray-800">{titulo}</h3>
      )}
      {children}
    </div>
  );
}
