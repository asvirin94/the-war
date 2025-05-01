import { store } from 'src/store'

export type StateType = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type PlayerType = {
    id: string;
    name: string;
    color?: string;
};

export type LobbyType = {
    id: string;
    isStarted: boolean;
    name: string;
    ownerId: string;
    password: string;
    players: PlayerType[];
}

export type UnitType = {
    id: string;
    ownerId: string;
    x: number;
    y: number;
}

export type FactoryType = {
    id: string;
    ownerId: string;
    x: number;
    y: number;
}
