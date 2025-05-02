import { combineReducers } from '@reduxjs/toolkit'

import { gameSlice } from 'src/store/game-process/game-process.slice'
import { wsSlice } from 'src/store/websocket-process/websocket-process.slice'

export const rootReducer = combineReducers({
    ['GAME']: gameSlice.reducer,
    ['WS']: wsSlice.reducer,
})
