// Mazo de 24 cartas temáticas del Día de Muertos

// Definición del mazo completo según los requisitos 8.1 y 8.2
export const DECK = [
  { id: 'cempasuchil', name: 'La Cempasúchil', emoji: '🌼' },
  { id: 'vela', name: 'La Vela', emoji: '🕯️' },
  { id: 'pan', name: 'El Pan de Muerto', emoji: '🍞' },
  { id: 'retrato', name: 'El Retrato', emoji: '🖼️' },
  { id: 'agua', name: 'El Agua', emoji: '💧' },
  { id: 'copal', name: 'El Copal', emoji: '💨' },
  { id: 'papel', name: 'El Papel Picado', emoji: '🎊' },
  { id: 'calavera', name: 'La Calavera', emoji: '💀' },
  { id: 'xolo', name: 'El Xoloitzcuintle', emoji: '🐕' },
  { id: 'catrina', name: 'La Catrina', emoji: '💃' },
  { id: 'alebrije', name: 'El Alebrije', emoji: '🦋' },
  { id: 'colibri', name: 'El Colibrí', emoji: '🐦' },
  { id: 'rio', name: 'El Río', emoji: '🌊' },
  { id: 'mariposa', name: 'La Mariposa', emoji: '🦋' },
  { id: 'obsidiana', name: 'La Obsidiana', emoji: '⚫' },
  { id: 'sol', name: 'El Sol', emoji: '☀️' },
  { id: 'altar', name: 'El Altar', emoji: '🏛️' },
  { id: 'mariachi', name: 'El Mariachi', emoji: '🎺' },
  { id: 'panteon', name: 'El Panteón', emoji: '⛪' },
  { id: 'familia', name: 'La Familia', emoji: '👨‍👩‍👧‍👦' },
  { id: 'charro', name: 'El Charro', emoji: '🤠' },
  { id: 'llorona', name: 'La Llorona', emoji: '👻' },
  { id: 'calaca', name: 'La Calaca', emoji: '💀' },
  { id: 'copalero', name: 'El Copalero', emoji: '🧙‍♂️' }
];

// Constantes del juego
export const GAME_CONSTANTS = {
  MAX_PLAYERS: 8,
  BOARD_SIZE: 16, // 4x4 grid
  DECK_SIZE: 24,
  CARD_INTERVAL: 4000, // 4 segundos en milisegundos
  ROOM_TTL: 2 * 60 * 60 * 1000, // 2 horas en milisegundos
  ROOM_CODE_LENGTH: 6
};

// Utility functions para el mazo
export function getCardById(id) {
  return DECK.find(card => card.id === id);
}

export function shuffleDeck() {
  const cardIds = DECK.map(card => card.id);
  return cardIds.sort(() => Math.random() - 0.5);
}

export function generateBoard(shuffledDeck) {
  return shuffledDeck.slice(0, GAME_CONSTANTS.BOARD_SIZE);
}