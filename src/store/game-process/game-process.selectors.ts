import { StateType } from 'src/lib/types'

export const getShouldAddFactory = (state: StateType) => state['GAME'].shouldAddFactory
export const getFactories = (state: StateType) => state['GAME'].factories
export const getShouldAddUnit = (state: StateType) => state['GAME'].shouldAddUnit
export const getUnits = (state: StateType) => state['GAME'].units
