import { createSlice } from '@reduxjs/toolkit'

type InitialStateType = {
    shouldAddTown: boolean;
    shouldAddFactory: boolean;
    shouldAddUnit: boolean;
}

export const appInitialState: InitialStateType = {
    shouldAddTown: false,
    shouldAddFactory: false,
    shouldAddUnit: false,
}

export const appSlice = createSlice({
    name: 'APP',
    initialState: appInitialState,
    reducers: {
        shouldAddTownChange: (state) => {
            state.shouldAddTown = !state.shouldAddTown
        },
        shouldAddFactoryChange: (state) => {
            state.shouldAddFactory = !state.shouldAddFactory
        },
        shouldAddUnitChange: (state) => {
            state.shouldAddUnit = !state.shouldAddUnit
        },
    }
})

export const {
    shouldAddTownChange,
    shouldAddFactoryChange,
    shouldAddUnitChange
} = appSlice.actions
