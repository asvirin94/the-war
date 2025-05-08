import { combineReducers } from '@reduxjs/toolkit'

import { appSlice } from 'src/store/app-process/app-process.slice'
import { wsSlice } from 'src/store/websocket-process/websocket-process.slice'
import { gameSlice } from 'src/store/game-process/game-process.slice'

export const rootReducer = combineReducers({
    ['APP']: appSlice.reducer,
    ['WS']: wsSlice.reducer,
    ['GAME']: gameSlice.reducer,
})
