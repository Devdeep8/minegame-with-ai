export type GameStatus = 'playing' | 'won' | 'lost'

export type Cell = {
  row: number
  col: number
  hasMine: boolean
  adjacentMines: number
  isRevealed: boolean
  isFlagged: boolean
}

export type Board = Cell[][]
