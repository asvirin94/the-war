import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { useParams } from 'react-router-dom'
import { nanoid } from 'nanoid';

import { addFactory, addTown, addUnit, changeUnit } from 'src/store/game-process/game-process.slice'
import {
    getFactories,
    getShouldAddFactory,
    getShouldAddTown,
    getShouldAddUnit,
    getTowns,
    getUnits
} from 'src/store/game-process/game-process.selectors'

import { clampOffset, generateHexMetrics, generateHexPoints, getHexAt, getPlayer } from 'src/lib/utils'
import { useAppDispatch, useAppSelector } from 'src/lib/hooks'
import { CONFIG } from 'src/lib/consts'
import { HexCoordsType, OffsetType } from 'src/lib/types'

import { Button } from 'src/ui/components/button.tsx'

import Town from 'src/ui/modules/GameScreen/components/Town'
import UnitTank from 'src/ui/modules/GameScreen/components/UnitTank'
import Factory from 'src/ui/modules/GameScreen/components/Factory'

import { AREAS } from './data';

export default function HexMap() {
    const user = getPlayer();
    const dispatch = useAppDispatch();

    const shouldAddTown = useAppSelector(getShouldAddTown)
    const myTowns = useAppSelector(getTowns)
    const shouldAddFactory = useAppSelector(getShouldAddFactory)
    const myFactories = useAppSelector(getFactories)
    const shouldAddUnit = useAppSelector(getShouldAddUnit)
    const myUnits = useAppSelector(getUnits)

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>(0);

    const [maps, setMaps] = useState<Map<number, HTMLCanvasElement>>(new Map());
    const [scaleIndex, setScaleIndex] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<OffsetType | null>(null);

    const [activeTownId, setActiveTownId] = useState<string | null>(null);
    const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
    const [activeFactoryId, setActiveFactoryId] = useState<string | null>(null);

    const [activeHex, setActiveHex] = useState<HexCoordsType | null>(null);

    // const {lobbyId} = useParams<{ lobbyId: string }>();

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
    ) => {
        const points = generateHexPoints(x, y, hexSize);

        ctx.beginPath();
        points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = color || CONFIG.HEX.COLORS.BASE;
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
            if (user?.color && !CONFIG.HEX.CLUSTER.includes(neighbor)) {
                ctx.beginPath();
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[(i + 1) % 6].x, points[(i + 1) % 6].y);
                ctx.strokeStyle = user?.color;
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

        for (let row = 0; row < CONFIG.HEX.ROWS; row++) {
            for (let col = 0; col < CONFIG.HEX.COLS; col++) {
                const isActive = row === activeHex?.row && col === activeHex.col
                const x = marginX + col * horizDist + (row % 2 === 1 ? horizDist / 2 : 0);
                const y = marginY + row * vertDist;
                drawHex(ctx, isActive, x, y, hexSize, areaColorMap.get(`${row}/${col}`));
            }
        }

        CONFIG.HEX.CLUSTER.forEach(hex => {
            const [row, col] = hex.split('/').map(Number);
            const x = marginX + col * horizDist + (row % 2 === 1 ? horizDist / 2 : 0);
            const y = marginY + row * vertDist;
            drawClusterBorders(ctx, row, col, x, y, hexSize);
        });

        return canvas;
    }, [areaColorMap, drawHex, drawClusterBorders]);

    const handleTownClick = (id: string) => {
        const town = myTowns?.find(t => t.id === id);
        if (!town) return;

        setActiveTownId(id)
        setActiveUnitId(null);
        setActiveHex(null);
        setActiveFactoryId(null)
    }

    const handleUnitClick = (id: string) => {
        const unit = myUnits?.find(u => u.id === id);
        if (!unit) return;

        setActiveUnitId(id);
        setActiveTownId(null)
        setActiveHex(null);
        setActiveFactoryId(null)
    };

    const handleUnitRightClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        e.preventDefault();

        if (!activeUnitId) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const hex = getHexAt(x, y, metrics, offset);

        if (hex && myUnits) {
            const unit = myUnits.find((u) => u.id === activeUnitId)
            if (unit) {
                dispatch(changeUnit({...unit, x: hex.row, y: hex.col}))
            }
        }
    };

    const handleFactoryClick = (id: string) => {
        const factory = myFactories?.find(f => f.id === id);
        if (!factory) return;

        setActiveFactoryId(id);
        setActiveTownId(null)
        setActiveUnitId(null);
        setActiveHex(null);
    }

    const handleHexClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDragging) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const hex = getHexAt(x, y, metrics, offset);

        if (hex) {
            if (user) {
                if (shouldAddFactory) {
                    dispatch(addFactory({
                        id: nanoid(),
                        ownerId: user.id,
                        x: hex?.row,
                        y: hex?.col,
                    }))

                    return
                }

                if (shouldAddUnit) {
                    dispatch(addUnit({
                        id: nanoid(),
                        ownerId: user.id,
                        x: hex.row,
                        y: hex.col,
                    }))

                    return
                }

                if (shouldAddTown) {
                    dispatch(addTown({
                        id: nanoid(),
                        ownerId: user.id,
                        x: hex.row,
                        y: hex.col,
                    }))

                    return
                }
            }

            setActiveHex(hex);
            setActiveTownId(null)
            setActiveUnitId(null);
            setActiveFactoryId(null)
        }
    }

    const renderTowns = useCallback(() => {
        const {horizDist, vertDist, hexSize, hexWidth} = metrics;
        if (!myTowns) return null;

        return myTowns.map((unit) => {

            const marginX = hexWidth / 2;
            const marginY = hexSize;

            const centerX = marginX + unit.y * horizDist + (unit.x % 2 ? horizDist / 2 : 0);
            const centerY = marginY + unit.x * vertDist;

            const screenX = centerX + offset.x;
            const screenY = centerY + offset.y;

            return (
                <Town
                    isActive={activeTownId === unit.id}
                    key={unit.id}
                    scale={0.8 * CONFIG.HEX.SCALES[scaleIndex]}
                    x={screenX}
                    y={screenY}
                    size={40}
                    onClick={() => handleTownClick(unit.id)}
                />
            );
        });
    }, [activeTownId, offset, metrics, myTowns])

    const renderUnits = useCallback(() => {
        const {horizDist, vertDist, hexSize, hexWidth} = metrics;
        if (!myUnits) return null;

        return myUnits.map((unit) => {

            const marginX = hexWidth / 2;
            const marginY = hexSize;

            const centerX = marginX + unit.y * horizDist + (unit.x % 2 ? horizDist / 2 : 0);
            const centerY = marginY + unit.x * vertDist;

            const screenX = centerX + offset.x;
            const screenY = centerY + offset.y;

            return (
                <UnitTank
                    isActive={activeUnitId === unit.id}
                    key={unit.id}
                    scale={0.8 * CONFIG.HEX.SCALES[scaleIndex]}
                    x={screenX}
                    y={screenY}
                    size={40}
                    onClick={() => handleUnitClick(unit.id)}
                />
            );
        });
    }, [activeUnitId, offset, metrics, myUnits])

    const renderFactories = useCallback(() => {
        const {horizDist, vertDist, hexSize, hexWidth} = metrics;
        if (!myFactories) return null;

        return myFactories.map((factory) => {

            const marginX = hexWidth / 2;
            const marginY = hexSize;

            const centerX = marginX + factory.y * horizDist + (factory.x % 2 ? horizDist / 2 : 0);
            const centerY = marginY + factory.x * vertDist;

            const screenX = centerX + offset.x;
            const screenY = centerY + offset.y;

            return (
                <Factory
                    isActive={activeFactoryId === factory.id}
                    key={factory.id}
                    scale={0.8 * CONFIG.HEX.SCALES[scaleIndex]}
                    x={screenX}
                    y={screenY}
                    size={40}
                    onClick={() => handleFactoryClick(factory.id)}
                />
            );
        });
    }, [activeFactoryId, offset, metrics, myFactories])

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
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(rafRef.current);
    }, [draw]);

    useEffect(() => {
        const newMap = new Map<number, HTMLCanvasElement>();
        for (const scale of CONFIG.HEX.SCALES) {
            const canvas = renderMap(scale);
            newMap.set(scale, canvas);
        }
        setMaps(newMap);
    }, [renderMap]);

    return (
        <div
            ref={containerRef}
            className="relative max-w-full max-h-full overflow-hidden border border-2 border-[#000000] bg-[#656464] active:cursor-grabbing touch-none"
        >
            {activeHex && (
                <div className='absolute bottom-1 left-1 w-60 h-120 flex flex-col p-5 bg-white'>
                    <Button className='bg-red-500 cursor-pointer' onClick={() => setActiveHex(null)}>закрыть</Button>
                    <p>{`${activeHex.row}/${activeHex.col}`}</p>
                </div>
            )}
            <canvas
                ref={canvasRef}
                className="block"
                onMouseDown={handleMouseDown}
                onClick={handleHexClick}
                onContextMenu={handleUnitRightClick}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onWheel={handleWheel}
            />
            {myFactories?.length && myFactories.length > 0 && renderFactories()}
            {myUnits?.length && myUnits.length > 0 && renderUnits()}
            {myTowns?.length && myTowns.length > 0 && renderTowns()}
        </div>
    );
};
