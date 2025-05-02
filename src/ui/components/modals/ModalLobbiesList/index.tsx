import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getPlayer} from 'src/lib/utils'
import { LobbyType, PlayerType } from 'src/lib/types'

import { Dialog, DialogContent, DialogTitle } from 'src/ui/components/dialog'
import { Button } from 'src/ui/components/button'
import { Input } from 'src/ui/components/input'

import { API_URL } from 'src/lib/consts'

type ModalGetLobbiesPropsType = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ModalLobbiesList({open, onOpenChange}: ModalGetLobbiesPropsType) {
    const [isLoading, setIsLoading] = useState(true)
    const [lobbies, setLobbies] = useState<LobbyType[]>([]);
    const [selectedLobby, setSelectedLobby] = useState<LobbyType | null>(null);
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const user: PlayerType | null = getPlayer();

    const fetchLobbies = async (): Promise<LobbyType[]> => {
        const response = await fetch(`http://${API_URL}/lobby/list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        return await response.json();
    }

    const getLobbies = async () => {
        setIsLoading(true)
        const lobbiesData = await fetchLobbies();
        setLobbies(lobbiesData);
        setIsLoading(false)
    };

    const handleJoinLobby = async (lobbyId: string, password: string) => {
        if (user) {
            const response = await fetch(`http://${API_URL}/lobby/join?lobby_id=${lobbyId}&user_id=${user.id}`, {
                method: 'POST',
                body: JSON.stringify({password}),
                headers: {'Content-Type': 'application/json'},
            });

            if (response.ok) {
                navigate(`/lobby/${lobbyId}`);
            }
        }
    };

    useEffect(() => {
        if (open) {
            getLobbies();
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='bg-[#fff]'>
                <DialogTitle>Список лобби</DialogTitle>
                {isLoading ? (
                    <p>Загружаем</p>
                ) : (
                    lobbies.length === 0 ? (
                        <p>Лобби отсутствуют</p>
                    ) : (
                        <ul>
                            {lobbies.map((lobby) => (
                                <li key={lobby.id} className="flex justify-between p-2 items-center border-b-1">
                                    <span className='w-[120px]'>{lobby.name}</span>
                                    <span>{lobby.players.length}</span>
                                    <Button
                                        className="text-blue-500 underline"
                                        onClick={() => {
                                            setSelectedLobby(lobby)
                                        }}
                                    >
                                        Присоединиться
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )
                )}
                <Button onClick={fetchLobbies}>Обновить</Button>
                {selectedLobby && selectedLobby.password && (
                    <div>
                        <h3>Введите пароль для {selectedLobby.name}</h3>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            placeholder="Пароль"
                        />
                        <Button
                            onClick={() => handleJoinLobby(selectedLobby.id, password)}
                            className="mt-4"
                        >
                            Присоединиться
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
