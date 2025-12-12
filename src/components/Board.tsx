import type { Board as BoardType, GameStatus } from '../game/types'
import Cell from './Cell'

type Props = {
  board: BoardType
  gameStatus: GameStatus
  onReveal: (row: number, col: number) => void
  onToggleFlag: (row: number, col: number) => void
}

export default function Board({ board, gameStatus, onReveal, onToggleFlag }: Props) {
  const rows = board.length
  const cols = board[0]?.length ?? 0

  return (
    <div
      className="ms-board"
      style={{
        gridTemplateColumns: `repeat(${cols}, 34px)`,
        gridTemplateRows: `repeat(${rows}, 34px)`,
      }}
    >
      {board.flatMap((row) =>
        row.map((cell) => (
          <Cell
            key={`${cell.row}-${cell.col}`}
            cell={cell}
            gameStatus={gameStatus}
            onReveal={onReveal}
            onToggleFlag={onToggleFlag}
          />
        )),
      )}
    </div>
  )
}
