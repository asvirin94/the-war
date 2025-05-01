import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { PlayerType } from 'src/lib/types.ts'

const LOCAL_STORAGE_KEY = 'player';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const savePlayer = (player: PlayerType) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(player));
}

export const getPlayer = (): PlayerType | null => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return null;

    return JSON.parse(data) as PlayerType;
}

export const clearPlayer= () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
}

