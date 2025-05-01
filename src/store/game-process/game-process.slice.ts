import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { FactoryType, UnitType } from 'src/lib/types'

type InitialStateType = {
    shouldAddFactory: boolean;
    factories: FactoryType[] | null;
    shouldAddUnit: boolean;
    units: UnitType[] | null;
}

export const gameInitialState: InitialStateType = {
    shouldAddFactory: false,
    factories: null,
    shouldAddUnit: false,
    units: null,
}

export const gameSlice = createSlice({
    name: 'GAME',
    initialState: gameInitialState,
    reducers: {
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
    shouldAddFactoryChange,
    addFactory,
    shouldAddUnitChange,
    addUnit,
    changeUnit,
} = gameSlice.actions
