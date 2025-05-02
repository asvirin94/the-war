import { StateType } from 'src/lib/types.ts'

export const getSocket = (state: StateType) => state['WS'].socket
export const getIsSocketConnected = (state: StateType) => state['WS'].isConnected
export const getLobbyId = (state: StateType) => state['WS'].lobbyId
