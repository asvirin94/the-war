import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { FactoryType, TownType, UnitType } from 'src/lib/types'

type InitialStateType = {
    shouldAddTown: boolean;
    towns: TownType[] | null;
    shouldAddFactory: boolean;
    factories: FactoryType[] | null;
    shouldAddUnit: boolean;
    units: UnitType[] | null;
}

export const gameInitialState: InitialStateType = {
    shouldAddTown: false,
    towns: null,
    shouldAddFactory: false,
    factories: null,
    shouldAddUnit: false,
    units: null,
}

export const gameSlice = createSlice({
    name: 'GAME',
    initialState: gameInitialState,
    reducers: {
        shouldAddTownChange: (state) => {
            state.shouldAddTown = !state.shouldAddTown
        },
        addTown: (state, action: PayloadAction<TownType>) => {
            if(state.towns) {
                state.towns.push(action.payload)
            }
            else {
                state.towns = [action.payload]
            }
            state.shouldAddTown = !state.shouldAddTown
        },
        shouldAddFactoryChange: (state) => {
            state.shouldAddFactory = !state.shouldAddFactory
        },
        addFactory: (state, action: PayloadAction<FactoryType>) => {
            if(state.factories) {
                state.factories.push(action.payload)
            }
            else {
                state.factories = [action.payload]
            }
            state.shouldAddFactory = !state.shouldAddFactory
        },
        shouldAddUnitChange: (state) => {
            state.shouldAddUnit = !state.shouldAddUnit
        },
        addUnit: (state, action: PayloadAction<UnitType>) => {
            if(state.units) {
                state.units.push(action.payload)
            }
            else {
                state.units = [action.payload]
            }
            state.shouldAddUnit = !state.shouldAddUnit
        },
        changeUnit: (state, action: PayloadAction<UnitType>) => {
            if (!state.units) return;

            const index = state.units.findIndex(unit => unit.id === action.payload.id);
            if (index !== -1) {
                state.units[index] = action.payload;
            }
        }
    }
})

export const {
    shouldAddTownChange,
    addTown,
    shouldAddFactoryChange,
    addFactory,
    shouldAddUnitChange,
    addUnit,
    changeUnit,
} = gameSlice.actions
