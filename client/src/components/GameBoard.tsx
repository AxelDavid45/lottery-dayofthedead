import React from 'react';
import { getCardById } from '../../../shared/types/deck';

interface GameBoardProps {
  board: string[];
  marks: boolean[];
  onCellClick: (index: number) => void;
  disabled?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  board, 
  marks, 
  onCellClick,
  disabled = false 
}) => {
  const handleClick = (index: number) => {
    if (!disabled) {
      onCellClick(index);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-3 max-w-2xl mx-auto">
      {board.map((cardId, index) => {
        const card = getCardById(cardId);
        const isMarked = marks[index];

        return (
          <button
            key={index}
            onClick={() => handleClick(index)}
            disabled={disabled}
            className={`
              relative aspect-square rounded-xl border-2 p-2 transition-all duration-200
              flex flex-col items-center justify-center
              ${isMarked 
                ? 'bg-gradient-to-br from-dia-purple to-purple-700 border-dia-purple text-white shadow-lg scale-95' 
                : 'bg-white border-gray-300 hover:border-dia-orange hover:shadow-lg hover:scale-105'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-95'}
            `}
          >
            <div className={`text-3xl sm:text-4xl mb-1 transition-opacity ${isMarked ? 'opacity-40' : ''}`}>
              {card?.emoji}
            </div>
            <div className={`text-xs sm:text-sm font-bold text-center font-inter ${
              isMarked ? 'text-white' : 'text-gray-700'
            }`}>
              {card?.name}
            </div>
            {isMarked && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-6xl sm:text-7xl text-white drop-shadow-lg">✓</div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
