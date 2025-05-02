import React from 'react'

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { HexCoordsType, HexMetricsType, OffsetType, PlayerType } from 'src/lib/types'
import { CONFIG, LOCAL_STORAGE_KEY } from 'src/lib/consts'


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

export const clearPlayer = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
}

export const generateHexMetrics = (scale: number): HexMetricsType => ({
    hexSize: CONFIG.HEX.SIZE * scale,
    hexWidth: Math.sqrt(3) * CONFIG.HEX.SIZE * scale,
    hexHeight: 2 * CONFIG.HEX.SIZE * scale,
    vertDist: 1.5 * CONFIG.HEX.SIZE * scale,
    horizDist: Math.sqrt(3) * CONFIG.HEX.SIZE * scale,
});

export const generateHexPoints = (x: number, y: number, hexSize: number) => {
    return Array.from({length: 6}, (_, i) => {
        const angle = (Math.PI / 180) * (60 * i - 30);
        return {
            x: x + hexSize * Math.cos(angle),
            y: y + hexSize * Math.sin(angle)
        };
    });
}

export const getHexAt = (
    mouseX: number,
    mouseY: number,
    metrics: HexMetricsType,
    offset: OffsetType
): HexCoordsType | null => {
    const {hexSize, horizDist, vertDist, hexWidth} = metrics;
    const marginX = hexWidth / 2;
    const marginY = hexSize;

    const bgMouseX = mouseX - offset.x;
    const bgMouseY = mouseY - offset.y;

    const approxRow = Math.floor((bgMouseY - marginY) / vertDist);
    const approxCol = Math.floor((bgMouseX - marginX - (approxRow % 2 ? horizDist / 2 : 0)) / horizDist);

    for (let dRow = -1; dRow <= 1; dRow++) {
        for (let dCol = -1; dCol <= 1; dCol++) {
            const row = approxRow + dRow;
            const col = approxCol + dCol;

            if (row < 0 || col < 0 || row >= CONFIG.HEX.ROWS || col >= CONFIG.HEX.COLS) continue;

            const centerX = marginX + col * horizDist + (row % 2 ? horizDist / 2 : 0);
            const centerY = marginY + row * vertDist;

            const dx = bgMouseX - centerX;
            const dy = bgMouseY - centerY;
            if (Math.sqrt(dx * dx + dy * dy) < hexSize * 1.1) {
                return {row, col};
            }
        }
    }
    return null;
};

export const clampOffset = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    x: number,
    y: number,
    metrics: HexMetricsType
) => {
    if (!containerRef.current) return {x, y};

    const contW = containerRef.current.clientWidth;
    const contH = containerRef.current.clientHeight;
    const canvasW = CONFIG.HEX.COLS * metrics.horizDist;
    const canvasH = CONFIG.HEX.ROWS * metrics.vertDist;

    const maxOffsetX = 1.5 * metrics.hexHeight;
    const minOffsetX = -canvasW + contW - 1.5 * metrics.hexHeight;
    const maxOffsetY = 1.5 * metrics.hexHeight;
    const minOffsetY = -canvasH + contH - 1.5 * metrics.hexHeight;

    return {x: Math.min(maxOffsetX, Math.max(minOffsetX, x)), y: Math.min(maxOffsetY, Math.max(minOffsetY, y))};
};
