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
    <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto">
      {board.map((cardId, index) => {
        const card = getCardById(cardId);
        const isMarked = marks[index];

        return (
          <button
            key={index}
            onClick={() => handleClick(index)}
            disabled={disabled}
            className={`
              aspect-square rounded-lg border-2 p-2 transition-all duration-200
              flex flex-col items-center justify-center
              ${isMarked 
                ? 'bg-dia-purple border-dia-purple text-white' 
                : 'bg-white border-gray-300 hover:border-dia-orange hover:shadow-md'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            <div className={`text-3xl sm:text-4xl mb-1 ${isMarked ? 'opacity-50' : ''}`}>
              {card?.emoji}
            </div>
            <div className={`text-xs sm:text-sm font-medium text-center ${
              isMarked ? 'text-white' : 'text-gray-700'
            }`}>
              {card?.name}
            </div>
            {isMarked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl text-white opacity-80">✓</div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
