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
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-10 text-center shadow-md">
        <p className="text-gray-500 font-medium font-inter">⏳ Esperando primera carta...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-dia-orange via-orange-400 to-dia-purple rounded-2xl p-8 md:p-10 text-center shadow-2xl transform transition-all duration-300">
      <div className="mb-4">
        <p className="text-white text-sm font-bold mb-1 font-inter tracking-wide">
          Carta {drawIndex + 1} de {totalCards}
        </p>
      </div>
      <div className="text-8xl md:text-9xl mb-6 animate-pulse">
        {card.emoji}
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 font-atkinson drop-shadow-lg">
        {card.name}
      </h2>
      {card.phrase && (
        <p className="text-white text-opacity-95 italic text-lg font-inter mt-3">
          "{card.phrase}"
        </p>
      )}
    </div>
  );
};
