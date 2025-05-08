import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PlayerType } from 'src/lib/types.ts'

type InitialStateType = {
    player: PlayerType | null,
    enemies: PlayerType[],
}

export const GameInitialState: InitialStateType = {
    player: null,
    enemies: [],
}

export const gameSlice = createSlice({
    name: 'GAME',
    initialState: GameInitialState,
    reducers: {
        setPlayer: (state, action: PayloadAction<PlayerType>) => {
            state.player = action.payload
        },
        setEnemies: (state, action: PayloadAction<PlayerType[]>) => {
            state.enemies = action.payload
        }
    }
})

export const {setPlayer, setEnemies} = gameSlice.actions
