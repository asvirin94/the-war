import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type InitialStateType = {
    socket: WebSocket | null;
}

const initialState: InitialStateType = {
    socket: null,
};

export const wsSlice = createSlice({
    name: 'WS',
    initialState,
    reducers: {
        connectSocket(state, action: PayloadAction<WebSocket>) {
            if (!state.socket) {
                state.socket = action.payload;
            }
        },
        disconnectSocket(state) {
            if (state.socket) {
                state.socket.close();
                state.socket = null;
            }
        },
    },
});

export const { connectSocket, disconnectSocket } = wsSlice.actions;
export default wsSlice.reducer;
