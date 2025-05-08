import { StateType } from 'src/lib/types.ts'

export const getPlayer = (state: StateType) => state['GAME'].player;
export const getEnemies = (state: StateType) => state['GAME'].enemies;
