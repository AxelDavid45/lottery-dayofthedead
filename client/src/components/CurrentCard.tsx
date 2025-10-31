import React from 'react';
import { Card } from '../../../shared/types';

interface CurrentCardProps {
  card: Card | null;
  drawIndex: number;
  totalCards: number;
}

export const CurrentCard: React.FC<CurrentCardProps> = ({ card, drawIndex, totalCards }) => {
  if (!card) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">Esperando primera carta...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-dia-orange to-dia-purple rounded-lg p-8 text-center shadow-lg">
      <div className="mb-4">
        <p className="text-white text-sm font-medium mb-1">
          Carta {drawIndex + 1} de {totalCards}
        </p>
      </div>
      <div className="text-8xl mb-4">
        {card.emoji}
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">
        {card.name}
      </h2>
      {card.phrase && (
        <p className="text-white text-opacity-90 italic">
          "{card.phrase}"
        </p>
      )}
    </div>
  );
};
