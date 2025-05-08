import { store } from 'src/store'

export type StateType = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type UserType = {
    id: string;
    name: string;
};

export type PlayerType = UserType & {
    color: string | null;
    towns: TownType[]
}

export type TownType = {
    id: string;
    ownerId: string;
    x: number;
    y: number;
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

export type LobbyType = {
    isStarted: boolean;
    status?: string;
    id: string;
    name: string;
    ownerId: string;
    password: string;
    players: PlayerType[];
}

export type OffsetType = {
    x: number;
    y: number;
};

export type HexCoordsType = {
    row: number;
    col: number;
};

export type HexMetricsType = {
    hexSize: number;
    hexWidth: number;
    hexHeight: number;
    vertDist: number;
    horizDist: number;
};
