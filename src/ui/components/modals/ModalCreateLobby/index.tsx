import { useState } from "react";
import { useNavigate } from 'react-router-dom'

import { getUser} from 'src/lib/utils'
import { LobbyType, UserType } from 'src/lib/types'
import { API_URL } from 'src/lib/consts'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "src/ui/components/dialog";
import { Label } from 'src/ui/components/label';
import { Input } from 'src/ui/components/input';
import { Button } from 'src/ui/components/button';

type ModalCreateLobbyType = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ModalCreateLobby({ open, onOpenChange }: ModalCreateLobbyType) {
    const [lobbyName, setLobbyName] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const user: UserType | null = getUser();

    const createLobby = async (lobbyName: string, password: string): Promise<LobbyType> => {
        const response = await fetch(`http://${API_URL}/lobby/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: lobbyName,
                password: password,
                player_id: user?.id,
            }),
        });

        return await response.json();
    };

    const handleSubmit = async () => {
        if(user) {
            if (!lobbyName.trim()) return;
            const lobby = await createLobby(lobbyName, password);
            if (lobby.id) {
                onOpenChange(false);
                navigate(`/lobby/${lobby.id}`);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-[#fff]">
                <DialogHeader>
                    <DialogTitle>Создать лобби</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="lobby-name">Название лобби</Label>
                        <Input
                            id="lobby-name"
                            placeholder="Введите название"
                            value={lobbyName}
                            onChange={(e) => setLobbyName(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">Пароль</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Введите пароль"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Создать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
