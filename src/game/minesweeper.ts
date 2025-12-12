import type { Board, Cell } from './types'

type Point = { row: number; col: number }

const neighborDeltas: Array<[number, number]> = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

export function createEmptyBoard(rows: number, cols: number): Board {
  const board: Board = []
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = []
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        hasMine: false,
        adjacentMines: 0,
        isRevealed: false,
        isFlagged: false,
      })
    }
    board.push(row)
  }
  return board
}

function inBounds(board: Board, row: number, col: number): boolean {
  return row >= 0 && row < board.length && col >= 0 && col < board[0]!.length
}

function getNeighbors(board: Board, p: Point): Point[] {
  const out: Point[] = []
  for (const [dr, dc] of neighborDeltas) {
    const nr = p.row + dr
    const nc = p.col + dc
    if (inBounds(board, nr, nc)) out.push({ row: nr, col: nc })
  }
  return out
}

function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => ({ ...cell })))
}

export function placeMines(board: Board, mineCount: number, avoid?: Point): Board {
  const rows = board.length
  const cols = board[0]!.length
  const maxMines = rows * cols - (avoid ? 1 : 0)
  const mines = Math.min(mineCount, maxMines)

  const positions: Point[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (avoid && avoid.row === r && avoid.col === c) continue
      positions.push({ row: r, col: c })
    }
  }

  // Fisher–Yates shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[positions[i], positions[j]] = [positions[j]!, positions[i]!]
  }

  const next = cloneBoard(board)
  for (let i = 0; i < mines; i++) {
    const p = positions[i]!
    next[p.row]![p.col]!.hasMine = true
  }

  return recomputeAdjacencies(next)
}

export function recomputeAdjacencies(board: Board): Board {
  const next = cloneBoard(board)
  for (let r = 0; r < next.length; r++) {
    for (let c = 0; c < next[0]!.length; c++) {
      const cell = next[r]![c]!
      if (cell.hasMine) {
        cell.adjacentMines = 0
        continue
      }
      const count = getNeighbors(next, { row: r, col: c }).reduce((acc, p) => {
        return acc + (next[p.row]![p.col]!.hasMine ? 1 : 0)
      }, 0)
      cell.adjacentMines = count
    }
  }
  return next
}

export function toggleFlag(board: Board, p: Point): Board {
  const next = cloneBoard(board)
  const cell = next[p.row]![p.col]!
  if (cell.isRevealed) return next
  cell.isFlagged = !cell.isFlagged
  return next
}

export function reveal(board: Board, p: Point): Board {
  const next = cloneBoard(board)
  const start = next[p.row]![p.col]!
  if (start.isRevealed || start.isFlagged) return next

  // If a mine is clicked, reveal it and stop.
  if (start.hasMine) {
    start.isRevealed = true
    return next
  }

  // Flood fill for 0-adjacent cells.
  const queue: Point[] = [p]
  const seen = new Set<string>()
  const key = (q: Point) => `${q.row},${q.col}`

  while (queue.length) {
    const cur = queue.shift()!
    const curCell = next[cur.row]![cur.col]!
    if (seen.has(key(cur))) continue
    seen.add(key(cur))

    if (curCell.isFlagged) continue
    curCell.isRevealed = true

    if (curCell.adjacentMines !== 0) continue

    for (const nb of getNeighbors(next, cur)) {
      const nbCell = next[nb.row]![nb.col]!
      if (nbCell.isRevealed || nbCell.hasMine) continue
      queue.push(nb)
    }
  }

  return next
}

export function revealAllMines(board: Board): Board {
  const next = cloneBoard(board)
  for (const row of next) {
    for (const cell of row) {
      if (cell.hasMine) cell.isRevealed = true
    }
  }
  return next
}

export function countFlags(board: Board): number {
  let n = 0
  for (const row of board) {
    for (const cell of row) {
      if (cell.isFlagged) n++
    }
  }
  return n
}

export function didWin(board: Board, mineCount: number): boolean {
  let revealedNonMines = 0
  const total = board.length * board[0]!.length
  for (const row of board) {
    for (const cell of row) {
      if (!cell.hasMine && cell.isRevealed) revealedNonMines++
    }
  }
  return revealedNonMines === total - mineCount
}
