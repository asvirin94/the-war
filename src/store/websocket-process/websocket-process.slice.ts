import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type InitialStateType = {
    socket: WebSocket | null;
    isConnected: boolean;
    lobbyId: string | null;
}

const initialState: InitialStateType = {
    socket: null,
    isConnected: false,
    lobbyId: null,
};

export const wsSlice = createSlice({
    name: 'WS',
    initialState,
    reducers: {
        connectSocket(state, action: PayloadAction<string>) {
            if (!state.socket) {
                state.socket = new WebSocket(action.payload);
                state.isConnected = false;
            }
        },
        connectionEstablished(state) {
            state.isConnected = true;
        },
        disconnectSocket(state) {
            if (state.socket) {
                state.socket.close();
                state.socket = null;
                state.isConnected = false;
            }
        },
        setLobbyId(state, action: PayloadAction<string>) {
            state.lobbyId = action.payload;
        },
    },
});

export const { connectSocket, connectionEstablished, disconnectSocket, setLobbyId } = wsSlice.actions;
export default wsSlice.reducer;
