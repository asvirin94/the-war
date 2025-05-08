type TownPropsType = {
    isActive: boolean;
    color: string;
    x: number;
    y: number;
    size: number;
    scale: number;
    // onClick: () => void;
};

export default function Town({isActive, color, x, y, size, scale}: TownPropsType) {
    const scaledSize = size * scale;
    const isBordered = isActive ? 'border-2 border-black' : ''

    return (
        <div
            className={`absolute flex items-center justify-center rounded-[20%] bg-${color}-500 ${isBordered}`}
            style={{
                left: x - scaledSize / 2,
                top: y - scaledSize / 2,
                width: scaledSize,
                height: scaledSize,
            }}
            // onClick={onClick}
        >
            <img
                src="./town.svg"
                className="object-contain"
                style={{
                    width: '75%',
                }}
            />
        </div>
    );
}
