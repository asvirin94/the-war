import { StateType } from 'src/lib/types'

export const getShouldAddTown = (state: StateType) => state['GAME'].shouldAddTown
export const getTowns = (state: StateType) => state['GAME'].towns
export const getShouldAddFactory = (state: StateType) => state['GAME'].shouldAddFactory
export const getFactories = (state: StateType) => state['GAME'].factories
export const getShouldAddUnit = (state: StateType) => state['GAME'].shouldAddUnit
export const getUnits = (state: StateType) => state['GAME'].units
