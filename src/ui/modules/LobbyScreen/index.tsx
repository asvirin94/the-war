import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { API_URL } from 'src/lib/consts.ts'
import { PlayerType } from 'src/lib/types.ts'
import { getPlayer, savePlayer } from 'src/lib/utils.ts'

import { Button } from "src/ui/components/button";
import { Card, CardContent } from "src/ui/components/card";

const AVAILABLE_COLORS = ['red', 'blue', 'green', 'purple'];

export default function LobbyScreen() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [players, setPlayers] = useState<PlayerType[]>([]);

    const navigate = useNavigate();
    const {lobbyId} = useParams<{ lobbyId: string }>();

    const user: PlayerType | null = getPlayer();
    const takenColors = players.map(p => p.color).filter(Boolean);

    const handleSelectColor = async (color: string) => {
        if (!user) return;

        await fetch(`${API_URL}/lobby/set_color?lobby_id=${lobbyId}&player_id=${user.id}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({color}),
        });

        savePlayer({...user, color,});
    };

    const handleLeaveLobby = async () => {
        if (user) {
            savePlayer({...user, color: '',});
            await fetch(`${API_URL}/lobby/leave?lobby_id=${lobbyId}&player_id=${user.id}`, {method: "POST"});
            navigate("/");
        }
    };

    const handleStartGame = async () => {
        if (!lobbyId) return;

        await fetch(`${API_URL}/lobby/start?lobby_id=${lobbyId}`, { method: "POST" });

        navigate(`/game/${lobbyId}`);
    };

    useEffect(() => {
        if (!lobbyId) return;

        const ws = new WebSocket(`${API_URL.replace(/^http/, 'ws')}/ws/lobby?lobby_id=${lobbyId}`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setPlayers(data.players);
            setIsGameStarted(data.isStarted);
        };

        setIsLoading(false)

        return () => {
            ws.close();
        };
    }, [lobbyId]);

    useEffect(() => {
        if (isGameStarted) {
            navigate(`/game/${lobbyId}`);
        }
    }, [isGameStarted]);

    if (!lobbyId) return <div>Лобби не найдено</div>;


    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center h-screen gap-6">
            <Card className="relative z-10 w-full max-w-md bg-white shadow-xl">
                <CardContent className="flex flex-col gap-4 p-6">
                    <h2 className="text-2xl font-bold text-center">Игроки в лобби</h2>
                    <div className="flex flex-col gap-2">
                        {isLoading ? (
                            <p className="text-lg text-center">Загрузка...</p>
                        ) : (
                            players.map((player) => (
                                <div key={player.id} className="text-lg text-center">
                                    {player.name} {player.color && `(${player.color})`}
                                </div>
                            ))
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-center mt-4">Выбрать цвет</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {AVAILABLE_COLORS.map((color) => (
                            <Button
                                disabled={takenColors.includes(color)}
                                key={color}
                                style={{backgroundColor: color, color: 'white'}}
                                onClick={() => handleSelectColor(color)}
                            />
                        ))}
                    </div>

                    {user?.color && (
                        <p className="text-center mt-2">Вы выбрали цвет:
                            <span style={{color: user?.color}}>{user?.color}</span>
                        </p>
                    )}

                    <Button onClick={handleStartGame} className="mt-5">
                        Начать игру
                    </Button>
                    <Button onClick={handleLeaveLobby}>
                        Выйти из лобби
                    </Button>
                </CardContent>
            </Card>
            <img src="./main-menu.gif" className="absolute w-full h-full object-cover"/>
        </div>
    );
}
