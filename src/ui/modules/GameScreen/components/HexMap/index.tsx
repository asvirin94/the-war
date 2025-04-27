import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AREAS } from './data.ts';

type Offset = {
    x: number;
    y: number;
};

type HexCoords = {
    row: number;
    col: number;
};

type HexMetrics = {
    hexSize: number;
    hexWidth: number;
    hexHeight: number;
    vertDist: number;
    horizDist: number;
};

const HEX_SIZE = 30;
const ROWS = 30;
const COLS = 50;
const SCALES = [1, 1.5, 2];

const generateHexMetrics = (scale: number): HexMetrics => ({
    hexSize: HEX_SIZE * scale,
    hexWidth: Math.sqrt(3) * HEX_SIZE * scale,
    hexHeight: 2 * HEX_SIZE * scale,
    vertDist: 1.5 * HEX_SIZE * scale,
    horizDist: Math.sqrt(3) * HEX_SIZE * scale,
});

const HexMap = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>(0);

    const [maps, setMaps] = useState<Map<number, HTMLCanvasElement>>(new Map());
    const [scaleIndex, setScaleIndex] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<Offset | null>(null);
    // const [hoveredHex, setHoveredHex] = useState<HexCoords | null>(null);
    const [activeHex, setActiveHex] = useState<HexCoords | null>(null);

    const metrics: HexMetrics = useMemo(() => generateHexMetrics(SCALES[scaleIndex]), [scaleIndex]);

    const [offset, setOffset] = useState<Offset>({x: 1.5 * metrics.hexHeight, y: 1.5 * metrics.hexHeight});

    const areaColorMap = useMemo(() => {
        const map = new Map<string, string>();
        for (const [, area] of Object.entries(AREAS)) {
            for (const hex of area.hexes) {
                map.set(hex, area.color);
            }
        }
        return map;
    }, []);

    const drawHex = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        hexSize: number,
        isActive: boolean,
        color?: string
    ) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 180) * (60 * i - 30);
            const px = x + hexSize * Math.cos(angle);
            const py = y + hexSize * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();

        if (color) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.fillStyle = '#07517a';
            ctx.fill();
        }

        if (isActive) {
            ctx.strokeStyle = "#0ff";
            ctx.lineWidth = 2;
        } else {
            ctx.strokeStyle = "#ccc";
            ctx.lineWidth = 1;
        }
        ctx.stroke();
    };

    const renderMap = useCallback((scale: number) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx || !canvas) return canvas;

        const {hexWidth, horizDist, vertDist, hexSize} = generateHexMetrics(scale);
        const marginX = hexWidth / 2;
        const marginY = hexSize;

        canvas.width = (COLS - 1) * horizDist + hexWidth + (horizDist / 2);
        canvas.height = (ROWS - 1) * vertDist + 2 * hexSize;

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const x = marginX + col * horizDist + (row % 2 === 1 ? horizDist / 2 : 0);
                const y = marginY + row * vertDist;

                const areaCode = row.toString() + '/' + col.toString();
                const color = areaColorMap.get(areaCode);

                drawHex(ctx, x, y, hexSize, false, color);
            }
        }

        return canvas;
    }, [areaColorMap]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const backgroundCanvas = maps.get(SCALES[scaleIndex]);
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
            drawHex(ctx, x, y, hexSize, true, color);
        }
    }, [metrics, offset, activeHex, maps, scaleIndex]);

    const getHexAt = (mouseX: number, mouseY: number): HexCoords | null => {
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

                if (row < 0 || col < 0 || row >= ROWS || col >= COLS) continue;

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

    const clampOffset = (x: number, y: number) => {
        if (!containerRef.current) return {x, y};

        const contW = containerRef.current.clientWidth;
        const contH = containerRef.current.clientHeight;
        const canvasW = COLS * metrics.horizDist;
        const canvasH = ROWS * metrics.vertDist;

        const maxOffsetX = 1.5 * metrics.hexHeight;
        const minOffsetX = -canvasW + contW - 1.5 * metrics.hexHeight;
        const maxOffsetY = 1.5 * metrics.hexHeight;
        const minOffsetY = -canvasH + contH - 1.5 * metrics.hexHeight;

        return {x: Math.min(maxOffsetX, Math.max(minOffsetX, x)), y: Math.min(maxOffsetY, Math.max(minOffsetY, y))};
    };

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
                return clampOffset(rawX, rawY);
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

    const handleMouseClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDragging) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setActiveHex(getHexAt(x, y))
    }

    const handleMouseUp = () => setDragStart(null);

    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();

        if (!containerRef.current || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setScaleIndex(prevIndex => {
            const newIndex = e.deltaY < 0 && prevIndex < SCALES.length - 1
                ? prevIndex + 1
                : e.deltaY > 0 && prevIndex > 0
                    ? prevIndex - 1
                    : prevIndex;

            if (newIndex !== prevIndex) {
                const mapX = mouseX - offset.x;
                const mapY = mouseY - offset.y;

                const scaleFactor = SCALES[newIndex] / SCALES[prevIndex];
                const newOffsetX = mouseX - mapX * scaleFactor;
                const newOffsetY = mouseY - mapY * scaleFactor;

                setOffset(clampOffset(newOffsetX, newOffsetY));
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
        for (const scale of SCALES) {
            const canvas = renderMap(scale);
            newMap.set(scale, canvas);
        }
        setMaps(newMap);
    }, [renderMap]);

    return (
        <div
            ref={containerRef}
            className="relative max-w-full max-h-full overflow-hidden border border-1 border-[#444] bg-[#1e1e1e] active:cursor-grabbing touch-none"
        >
            {activeHex && (
                <div className='absolute bottom-1 left-1 w-60 h-120 flex flex-col p-5 bg-white'>
                    <button className='bg-red-500 cursor-pointer' onClick={() => setActiveHex(null)}>закрыть</button>
                    <p>{`${activeHex.row}/${activeHex.col}`}</p>
                </div>
            )}
            <canvas
                ref={canvasRef}
                className="block"
                onMouseDown={handleMouseDown}
                onClick={handleMouseClick}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onWheel={handleWheel}
            />
        </div>
    );
};

export default HexMap;
