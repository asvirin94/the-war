import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { setEnemies, setPlayer } from 'src/store/game-process/game-process.slice'
import { getPlayer } from 'src/store/game-process/game-process.selectors'
import { connectSocket, disconnectSocket } from 'src/store/websocket-process/websocket-process.slice'

import { useAppDispatch, useAppSelector } from 'src/lib/hooks.ts'
import { API_URL } from 'src/lib/consts.ts'
import { LobbyType, PlayerType, UserType } from 'src/lib/types.ts'
import { getUser, handleLeaveLobby, handleSelectColor, handleStartGame } from 'src/lib/utils'

import { Button } from "src/ui/components/button";
import { Card, CardContent } from "src/ui/components/card";

const AVAILABLE_COLORS = ['red', 'blue', 'green', 'purple', 'yellow'];

export default function LobbyScreen() {
    const dispatch = useAppDispatch()
    const player = useAppSelector(getPlayer)

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [players, setPlayers] = useState<PlayerType[]>([]);

    const navigate = useNavigate();
    const {lobbyId} = useParams<{ lobbyId: string }>();

    const user: UserType = getUser() as UserType;

    const takenColors = players.map(p => p.color).filter(Boolean);

    useEffect(() => {
        const ws = new WebSocket(`ws://${API_URL}/ws/lobby?lobby_id=${lobbyId}`);
        dispatch(connectSocket(ws));

        ws.onmessage = (event) => {
            const data: LobbyType = JSON.parse(event.data);
            if (data.status === "lobby not found") {
                navigate('/');
                return;
            }

            setPlayers(data.players);
            setIsGameStarted(data.isStarted);

            const clientPlayer = data.players.find((p) => p.id === user.id);
            const otherPlayers = data.players.filter((p) => p.id !== user.id);

            if(clientPlayer) {
                dispatch(setPlayer(clientPlayer))
            }
            if(otherPlayers) {
                dispatch(setEnemies(otherPlayers))
            }

            setIsLoading(false);
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
                                onClick={() => handleSelectColor(color, lobbyId, user)}
                            />
                        ))}
                    </div>

                    {player?.color && (
                        <p className="text-center mt-2">Вы выбрали цвет:
                            <span style={{color: player?.color}}>{` ${player?.color}`}</span>
                        </p>
                    )}

                    <Button onClick={() => {
                        handleStartGame(lobbyId);
                        navigate(`/game/${lobbyId}`);
                    }} className="mt-5">
                        Начать игру
                    </Button>
                    <Button onClick={() => {
                        handleLeaveLobby(lobbyId, user);
                        dispatch(disconnectSocket())
                        navigate('/')
                    }}>
                        Выйти из лобби
                    </Button>
                </CardContent>
            </Card>
            <img src="./main-menu.gif" className="absolute w-full h-full object-cover"/>
        </div>
    );
}
