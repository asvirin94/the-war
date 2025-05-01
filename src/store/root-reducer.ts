import { combineReducers } from '@reduxjs/toolkit'

import { gameSlice } from 'src/store/game-process/game-process.slice'

export const rootReducer = combineReducers({
    ['GAME']: gameSlice.reducer,
})
