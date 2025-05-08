import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from 'react-router-dom'

import { shouldAddTownChange } from 'src/store/app-process/app-process.slice'

import {
    getShouldAddTown,
} from 'src/store/app-process/app-process.selectors'


import {
    clampOffset,
    generateHexMetrics,
    generateHexPoints,
    getHexAt,
    getUser,
} from 'src/lib/utils'
import { useAppDispatch, useAppSelector } from 'src/lib/hooks'
import { API_URL, CONFIG } from 'src/lib/consts'
import { HexCoordsType, LobbyType, OffsetType, PlayerType } from 'src/lib/types'

import { Button } from 'src/ui/components/button'

import Town from 'src/ui/modules/GameScreen/components/MapEntities/Town'

import { AREAS } from './data';

export default function HexMap({socket, player, enemies}: { socket: WebSocket, player: PlayerType, enemies: PlayerType[] }) {
    const user = getUser();
    const dispatch = useAppDispatch();

    const [isLoading, setIsLoading] = useState(true)
    const [myState, setMyState] = useState<PlayerType | null>(null)
    const [enemiesState, setEnemiesState] = useState<PlayerType[]>([])
    const shouldAddTown = useAppSelector(getShouldAddTown)

    const {lobbyId} = useParams<{ lobbyId: string }>();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>(0);

    const [maps, setMaps] = useState<Map<number, HTMLCanvasElement>>(new Map());
    const [scaleIndex, setScaleIndex] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<OffsetType | null>(null);

    const [activeTownId, setActiveTownId] = useState<string | null>(null);
    const [waterImage, setWaterImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new Image();
        img.src = './water.jpg';
        img.onload = () => {
            setWaterImage(img);
        };
    }, []);

    const [activeHex, setActiveHex] = useState<HexCoordsType | null>(null);

    const metrics = useMemo(() => generateHexMetrics(CONFIG.HEX.SCALES[scaleIndex]), [scaleIndex]);

    const [offset, setOffset] = useState<OffsetType>({x: 1.5 * metrics.hexHeight, y: 1.5 * metrics.hexHeight});

    const areaColorMap = useMemo(() => {
        const map = new Map<string, string>();
        Object.values(AREAS).forEach(area => {
            area.hexes.forEach(hex => map.set(hex, area.color));
        });
        return map;
    }, []);

    const drawHex = useCallback((
        ctx: CanvasRenderingContext2D,
        isActive: boolean,
        x: number,
        y: number,
        hexSize: number,
        color?: string,
        pattern?: CanvasPattern
    ) => {
        const points = generateHexPoints(x, y, hexSize);
        ctx.beginPath();
        points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.closePath();

        if (pattern) {
            ctx.fillStyle = pattern;
        } else {
            ctx.fillStyle = color || CONFIG.HEX.COLORS.BASE;
        }
        ctx.fill();

        if (isActive) {
            ctx.strokeStyle = CONFIG.HEX.COLORS.ACTIVE;
        } else {
            ctx.strokeStyle = CONFIG.HEX.COLORS.BORDER;
        }
        ctx.lineWidth = 1;
        ctx.stroke();
    }, []);

    const drawClusterBorders = useCallback((
        ctx: CanvasRenderingContext2D,
        row: number,
        col: number,
        x: number,
        y: number,
        hexSize: number
    ) => {
        const neighbors = row % 2 === 0
            ? [
                `${row}/${col + 1}`, `${row + 1}/${col}`,
                `${row + 1}/${col - 1}`, `${row}/${col - 1}`,
                `${row - 1}/${col - 1}`, `${row - 1}/${col}`
            ]
            : [
                `${row}/${col + 1}`, `${row + 1}/${col + 1}`,
                `${row + 1}/${col}`, `${row}/${col - 1}`,
                `${row - 1}/${col}`, `${row - 1}/${col + 1}`
            ];

        const points = generateHexPoints(x, y, hexSize);
        neighbors.forEach((neighbor, i) => {
            if (!CONFIG.HEX.CLUSTER.includes(neighbor)) {
                ctx.beginPath();
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[(i + 1) % 6].x, points[(i + 1) % 6].y);
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 10;
                ctx.stroke();
            }
        });
    }, []);

    const renderMap = useCallback((scale: number) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return canvas;

        const {hexWidth, horizDist, vertDist, hexSize} = generateHexMetrics(scale);
        const marginX = hexWidth / 2;
        const marginY = hexSize;

        canvas.width = (CONFIG.HEX.COLS - 1) * horizDist + hexWidth + (horizDist / 2);
        canvas.height = (CONFIG.HEX.ROWS - 1) * vertDist + 2 * hexSize;

        let waterPattern: CanvasPattern | null = null;
        if(waterImage) {
            waterPattern = ctx.createPattern(waterImage, 'repeat');
        }

        for (let row = 0; row < CONFIG.HEX.ROWS; row++) {
            for (let col = 0; col < CONFIG.HEX.COLS; col++) {
                const isActive = row === activeHex?.row && col === activeHex.col
                const x = marginX + col * horizDist + (row % 2 === 1 ? horizDist / 2 : 0);
                const y = marginY + row * vertDist;
                const color = areaColorMap.get(`${row}/${col}`);

                if (color) {
                    drawHex(ctx, isActive, x, y, hexSize, color);
                } else if (waterPattern) {
                    drawHex(ctx, isActive, x, y, hexSize, undefined, waterPattern);
                } else {
                    drawHex(ctx, isActive, x, y, hexSize, CONFIG.HEX.COLORS.BASE);
                }
            }
        }

        CONFIG.HEX.CLUSTER.forEach(hex => {
            const [row, col] = hex.split('/').map(Number);
            const x = marginX + col * horizDist + (row % 2 === 1 ? horizDist / 2 : 0);
            const y = marginY + row * vertDist;
            drawClusterBorders(ctx, row, col, x, y, hexSize);
        });

        return canvas;
    }, [areaColorMap, drawHex, drawClusterBorders, waterImage]);

    const handleHexClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDragging) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const hex = getHexAt(x, y, metrics, offset);

        if (hex) {
            if (user) {
                if (shouldAddTown) {
                    fetch(`http://${API_URL}/game/town?lobby_id=${lobbyId}&player_id=${user.id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            x: hex.row,
                            y: hex.col,
                        }),
                    });
                    dispatch(shouldAddTownChange())

                    return
                }
            }

            setActiveHex(hex);
            setActiveTownId(null)
        }
    }

    const renderTowns = useCallback(() => {
        const {horizDist, vertDist, hexSize, hexWidth} = metrics;
        if (!myState) return null;
        const { towns } = myState
        if (!towns) return null;

        return towns.map((town) => {
            const marginX = hexWidth / 2;
            const marginY = hexSize;

            const centerX = marginX + town.y * horizDist + (town.x % 2 ? horizDist / 2 : 0);
            const centerY = marginY + town.x * vertDist;

            const screenX = centerX + offset.x;
            const screenY = centerY + offset.y;

            return (
                <Town
                    isActive={activeTownId === town.id}
                    color={myState.color || 'red'}
                    key={town.id}
                    scale={0.8 * CONFIG.HEX.SCALES[scaleIndex]}
                    x={screenX}
                    y={screenY}
                    size={40}
                    // onClick={() => handleTownClick(unit.id)}
                />
            );
        });
    }, [activeTownId, offset, metrics, myState])

    const renderEnemyTowns = useCallback(() => {
        const { horizDist, vertDist, hexSize, hexWidth } = metrics;
        if (!enemiesState?.length) return null;

        return enemiesState.flatMap((enemy) => {
            const { towns, color: enemyColor } = enemy;
            if (!towns) return [];

            return towns.map((town) => {
                const marginX = hexWidth / 2;
                const marginY = hexSize;

                const centerX = marginX + town.y * horizDist + (town.x % 2 ? horizDist / 2 : 0);
                const centerY = marginY + town.x * vertDist;

                const screenX = centerX + offset.x;
                const screenY = centerY + offset.y;

                return (
                    <Town
                        key={`${town.id}`}
                        isActive={activeTownId === town.id}
                        color={enemyColor as string}
                        scale={0.8 * CONFIG.HEX.SCALES[scaleIndex]}
                        x={screenX}
                        y={screenY}
                        size={40}
                        // onClick={() => handleTownClick(unit.id)}
                    />
                );
            });
        });
    }, [activeTownId, offset, metrics, enemiesState, scaleIndex]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const backgroundCanvas = maps.get(CONFIG.HEX.SCALES[scaleIndex]);
        if (!canvas || !ctx || !backgroundCanvas) return;

        canvas.width = backgroundCanvas.width;
        canvas.height = backgroundCanvas.height;

        ctx.drawImage(backgroundCanvas, offset.x, offset.y);

        if (activeHex) {
            const {row, col} = activeHex;
            const {horizDist, vertDist, hexSize, hexWidth} = metrics;
            const marginX = hexWidth / 2;
            const marginY = hexSize;
            const centerX = marginX + col * horizDist + (row % 2 ? horizDist / 2 : 0);
            const centerY = marginY + row * vertDist;
            const x = centerX + offset.x;
            const y = centerY + offset.y;
            const areaCode = row.toString() + '/' + col.toString();
            const color = areaColorMap.get(areaCode);
            drawHex(ctx, true, x, y, hexSize, color);
        }
    }, [metrics, offset, activeHex, maps, scaleIndex]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (dragStart) {
            const dx = x - dragStart.x;
            const dy = y - dragStart.y;

            setOffset(prev => {
                const rawX = prev.x + dx;
                const rawY = prev.y + dy;
                return clampOffset(containerRef, rawX, rawY, metrics);
            });
            setDragStart({x, y});
            setIsDragging(true);
        } else {
            // setHoveredHex(getHexAt(x, y));
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (e.button === 0) {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setDragStart({x, y});
            setIsDragging(false);
        }
    };

    const handleMouseUp = () => setDragStart(null);

    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        if (!containerRef.current || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setScaleIndex(prevIndex => {
            const newIndex = e.deltaY < 0 && prevIndex < CONFIG.HEX.SCALES.length - 1
                ? prevIndex + 1
                : e.deltaY > 0 && prevIndex > 0
                    ? prevIndex - 1
                    : prevIndex;

            if (newIndex !== prevIndex) {
                const mapX = mouseX - offset.x;
                const mapY = mouseY - offset.y;

                const scaleFactor = CONFIG.HEX.SCALES[newIndex] / CONFIG.HEX.SCALES[prevIndex];
                const newOffsetX = mouseX - mapX * scaleFactor;
                const newOffsetY = mouseY - mapY * scaleFactor;

                setOffset(clampOffset(containerRef, newOffsetX, newOffsetY, metrics));
            }

            return newIndex;
        });
    };

    useEffect(() => {
        if(socket) {
            socket.onmessage = (event) => {
                const data: LobbyType = JSON.parse(event.data);
                const myData = data.players.find((p) => p.id === user?.id);
                const enemiesData = data.players.filter((p) => p.id !== user?.id);
                if(myData) {
                    setMyState(myData);
                }
                setEnemiesState(enemiesData);
            };
        }
    }, [socket]);

    useEffect(() => {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(rafRef.current);
    }, [draw]);

    useEffect(() => {
        if(waterImage) {
            const newMap = new Map<number, HTMLCanvasElement>();
            for (const scale of CONFIG.HEX.SCALES) {
                const canvas = renderMap(scale);
                newMap.set(scale, canvas);
            }
            setMaps(newMap);
            setIsLoading(false)
        }
    }, [renderMap, waterImage]);

    return (
        <div
            ref={containerRef}
            className="relative max-w-full max-h-full overflow-hidden border-2 border-[#000000] bg-[#656464] active:cursor-grabbing touch-none"
        >
            {activeHex && (
                <div className='absolute bottom-1 left-1 w-60 h-120 flex flex-col p-5 bg-white'>
                    <Button
                        className='bg-red-500 cursor-pointer'
                        onClick={() => setActiveHex(null)}
                    >
                        закрыть
                    </Button>
                    <p>{`${activeHex.row}/${activeHex.col}`}</p>
                </div>
            )}
            <canvas
                ref={canvasRef}
                className="block"
                onMouseDown={handleMouseDown}
                onClick={handleHexClick}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onWheel={handleWheel}
            />
            {renderTowns()}
            {renderEnemyTowns()}
        </div>
    );
};
