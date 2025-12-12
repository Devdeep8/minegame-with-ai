import type { Cell as CellType, GameStatus } from '../game/types'

type Props = {
  cell: CellType
  gameStatus: GameStatus
  onReveal: (row: number, col: number) => void
  onToggleFlag: (row: number, col: number) => void
}

function cellLabel(cell: CellType): string {
  if (!cell.isRevealed) return ''
  if (cell.hasMine) return '💣'
  return cell.adjacentMines === 0 ? '' : String(cell.adjacentMines)
}

export default function Cell({ cell, gameStatus, onReveal, onToggleFlag }: Props) {
  const disabled = gameStatus !== 'playing'

  return (
    <button
      className={
        'ms-cell' +
        (cell.isRevealed ? ' is-revealed' : '') +
        (cell.isFlagged ? ' is-flagged' : '') +
        (cell.hasMine && cell.isRevealed ? ' is-mine' : '')
      }
      disabled={disabled}
      onClick={() => onReveal(cell.row, cell.col)}
      onContextMenu={(e) => {
        e.preventDefault()
        onToggleFlag(cell.row, cell.col)
      }}
      aria-label={`cell ${cell.row},${cell.col}`}
    >
      {cell.isFlagged && !cell.isRevealed ? '🚩' : cellLabel(cell)}
    </button>
  )
}
