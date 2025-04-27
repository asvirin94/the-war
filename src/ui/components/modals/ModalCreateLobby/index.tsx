import { useState } from "react";

import { createLobby } from 'src/lib/utils.ts'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "src/ui/components/dialog";
import { Label } from 'src/ui/components/label';
import { Input } from 'src/ui/components/input';
import { Button } from 'src/ui/components/button.tsx';

type CreateLobbyModalType = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ModalCreateLobby({ open, onOpenChange }: CreateLobbyModalType) {
    const [lobbyName, setLobbyName] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = () => {
        if (!lobbyName.trim()) return;
        createLobby(lobbyName, password);
        onOpenChange(false);
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
                            minLength={2}  // Для ограничения минимальной длины
                            maxLength={10} // Для ограничения максимальной длины
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
