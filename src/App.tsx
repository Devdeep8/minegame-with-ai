import { useEffect, useMemo, useState } from 'react'
import './App.css'
import Board from './components/Board'
import {
  countFlags,
  createEmptyBoard,
  didWin,
  placeMines,
  reveal,
  revealAllMines,
  toggleFlag,
} from './game/minesweeper'
import type { Board as BoardType, GameStatus } from './game/types'

type Preset = {
  label: string
  rows: number
  cols: number
  mines: number
}

const presets: Preset[] = [
  { label: 'Beginner (9×9, 10)', rows: 9, cols: 9, mines: 10 },
  { label: 'Intermediate (16×16, 40)', rows: 16, cols: 16, mines: 40 },
  { label: 'Expert (16×30, 99)', rows: 16, cols: 30, mines: 99 },
]

function App() {
  const [presetIndex, setPresetIndex] = useState(0)
  const preset = presets[presetIndex]!

  const [board, setBoard] = useState<BoardType>(() =>
    createEmptyBoard(preset.rows, preset.cols),
  )
  const [minesPlaced, setMinesPlaced] = useState(false)
  const [status, setStatus] = useState<GameStatus>('playing')

  useEffect(() => {
    setBoard(createEmptyBoard(preset.rows, preset.cols))
    setMinesPlaced(false)
    setStatus('playing')
  }, [preset.rows, preset.cols])

  const flags = useMemo(() => countFlags(board), [board])
  const minesLeft = Math.max(0, preset.mines - flags)

  const restart = () => {
    setBoard(createEmptyBoard(preset.rows, preset.cols))
    setMinesPlaced(false)
    setStatus('playing')
  }

  const onReveal = (row: number, col: number) => {
    if (status !== 'playing') return

    setBoard((prev) => {
      let next = prev

      // Place mines after the first click so the first cell is never a mine.
      if (!minesPlaced) {
        next = placeMines(next, preset.mines, { row, col })
        setMinesPlaced(true)
      }

      next = reveal(next, { row, col })

      const revealedCell = next[row]?.[col]
      if (revealedCell?.hasMine && revealedCell.isRevealed) {
        setStatus('lost')
        return revealAllMines(next)
      }

      if (didWin(next, preset.mines)) {
        setStatus('won')
      }

      return next
    })
  }

  const onToggleFlag = (row: number, col: number) => {
    if (status !== 'playing') return
    setBoard((prev) => toggleFlag(prev, { row, col }))
  }

  const statusText =
    status === 'playing'
      ? 'Playing'
      : status === 'won'
        ? 'You won'
        : 'You hit a mine'

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1 className="app-title">Minesweeper</h1>
          <div className="app-subtitle">React + TypeScript</div>
        </div>

        <div className="controls">
          <label className="control">
            Difficulty
            <select
              value={presetIndex}
              onChange={(e) => setPresetIndex(Number(e.target.value))}
            >
              {presets.map((p, idx) => (
                <option key={p.label} value={idx}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <button onClick={restart}>New game</button>
        </div>
      </header>

      <section className="hud">
        <div className="hud-item">
          <div className="hud-label">Mines left</div>
          <div className="hud-value">{minesLeft}</div>
        </div>
        <div className="hud-item">
          <div className="hud-label">Flags</div>
          <div className="hud-value">{flags}</div>
        </div>
        <div className="hud-item">
          <div className="hud-label">Status</div>
          <div className="hud-value">{statusText}</div>
        </div>
      </section>

      <main className="game">
        <Board board={board} gameStatus={status} onReveal={onReveal} onToggleFlag={onToggleFlag} />
        <p className="help">
          Left click to reveal. Right click to flag.
        </p>
      </main>
    </div>
  )
}

export default App
