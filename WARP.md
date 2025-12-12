# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview
This is a small React + TypeScript Minesweeper game built with Vite.

The app is intentionally split into:
- UI/components in `src/`
- pure game rules/state transitions in `src/game/`

## Common commands (PowerShell)
Install deps:
- `npm install`

Run dev server (HMR):
- `npm run dev`

Production build (typecheck + bundle):
- `npm run build`
  - runs `tsc -b` (project references) and then `vite build`

Preview the production build locally:
- `npm run preview`

Lint:
- `npm run lint`

Tests:
- No test runner is currently configured (there is no `test` script in `package.json`).

## High-level architecture
### Runtime entrypoints
- `index.html` mounts the app into `#root`.
- `src/main.tsx` is the React entrypoint (creates the root, renders `<App />`).

### State ownership and UI flow
- `src/App.tsx` is the stateful container for the whole game.
  - Owns `board: Board`, `minesPlaced: boolean`, and `status: GameStatus`.
  - Owns difficulty selection via presets (rows/cols/mines).
  - Places mines on the first reveal action so the first clicked cell is never a mine.
  - After each action, determines win/loss and updates status.

- `src/components/Board.tsx` is a presentational component.
  - Renders a CSS grid sized from the `board` 2D array dimensions.
  - Maps each cell to `src/components/Cell.tsx`.

- `src/components/Cell.tsx` is the interactive cell.
  - Left click calls `onReveal(row, col)`.
  - Right click (context menu) calls `onToggleFlag(row, col)`.
  - Visual state is driven entirely by `cell` fields (`isRevealed`, `isFlagged`, `hasMine`) plus `gameStatus`.

### Game rules (pure functions)
All gameplay logic is centralized in `src/game/minesweeper.ts` and operates on:
- `Board` = `Cell[][]` and `Cell`/`GameStatus` types in `src/game/types.ts`.

Key functions:
- `createEmptyBoard(rows, cols)`: initializes a board.
- `placeMines(board, mineCount, avoid?)`: places mines (uses a shuffle); `avoid` is used for “safe first click”.
- `recomputeAdjacencies(board)`: recomputes `adjacentMines` counts for every non-mine cell.
- `reveal(board, {row, col})`: reveals a cell; does a flood fill from 0-adjacent cells.
- `toggleFlag(board, {row, col})`: flags/unflags a non-revealed cell.
- `revealAllMines(board)`: used on loss.
- `didWin(board, mineCount)`: win condition is “all non-mine cells revealed”.

Important implementation detail:
- State transitions are implemented immutably via a full `cloneBoard()` (each action returns a new `Board`).

### Styling
- Most app and game styles (including `.ms-board` and `.ms-cell` states) are in `src/App.css`.

## Notes on repo docs and rules
- `README.md` is the default Vite/React template README and does not currently document app-specific behavior beyond the toolchain.
- No additional agent instruction files were found (no `CLAUDE.md`, `.cursor/rules`, or `.github/copilot-instructions.md`).
