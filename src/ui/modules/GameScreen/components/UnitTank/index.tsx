import { getPlayer } from 'src/lib/utils.ts'

type UnitTankPropsType = {
    isActive: boolean;
    x: number;
    y: number;
    size: number;
    scale: number;
    onClick: () => void;
};

export default function UnitTank({ isActive, x, y, size, scale, onClick }: UnitTankPropsType) {
    const user = getPlayer();
    const scaledSize = size * scale;
    const isBordered = isActive ? 'border-2 border-black' : ''

    return (
        <div
            className={`absolute flex items-center justify-center rounded-[50%] bg-${user?.color}-500 ${isBordered}`}
            style={{
                left: x - scaledSize / 2,
                top: y - scaledSize / 2,
                width: scaledSize,
                height: scaledSize,
            }}
            onClick={onClick}
        >
            <img
                src="./tank-icon.png"
                className="object-contain"
                style={{
                    width: '115%',
                    height: '115%',
                }}
            />
        </div>
    );
}
