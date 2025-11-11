/**
 * Componente de Indicador
 * Exibe um indicador com sua pontuação e atingimento
 */

import React from 'react';
import { formatarPercentual } from '@/utils/formatacao';

interface IndicadorCardProps {
  nome: string;
  pontuacao: number;
  atingimento: number;
  peso: number;
  meta?: number;
}

export default function IndicadorCard({ 
  nome, 
  pontuacao, 
  atingimento, 
  peso,
  meta 
}: IndicadorCardProps) {
  // Define cor baseada no atingimento
  const getCorAtingimento = (atingimento: number) => {
    if (atingimento >= 100) return 'text-green-600 bg-green-50';
    if (atingimento >= 80) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="card border-l-4 border-primary-500">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-lg text-gray-800">{nome}</h4>
        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
          Peso: {peso}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className={`p-3 rounded ${getCorAtingimento(atingimento)}`}>
          <div className="text-2xl font-bold">
            {pontuacao.toFixed(2)}
          </div>
          <div className="text-sm">
            Atingimento: {formatarPercentual(atingimento)}
          </div>
        </div>
        
        {meta && (
          <div className="text-sm text-gray-600">
            Meta: {meta.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}
