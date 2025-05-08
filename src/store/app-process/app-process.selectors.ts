import { StateType } from 'src/lib/types'

export const getShouldAddTown = (state: StateType) => state['APP'].shouldAddTown
export const getShouldAddFactory = (state: StateType) => state['APP'].shouldAddFactory
export const getShouldAddUnit = (state: StateType) => state['APP'].shouldAddUnit
