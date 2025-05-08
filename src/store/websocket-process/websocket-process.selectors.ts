import { StateType } from 'src/lib/types.ts'

export const getSocket = (state: StateType) => state['WS'].socket
