import { useState } from "react";

import { saveUser } from "src/lib/utils";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "src/ui/components/dialog";
import { Input } from "src/ui/components/input";
import { Button } from "src/ui/components/button";
import { Label } from "src/ui/components/label";

type ModalRegisterType = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function ModalRegister({ open, onOpenChange }: ModalRegisterType) {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        if (!name.trim() || !password.trim()) return;
        const res = await fetch('http://109.73.199.202/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password }),
        });
        const data = await res.json();
        saveUser(data);
        onOpenChange(false);
        window.location.reload();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-[#fff]">
                <DialogHeader>
                    <DialogTitle>Регистрация</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Имя</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">Пароль</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleRegister}>Зарегистрироваться</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
