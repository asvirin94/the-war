import { useEffect, useState } from "react";

import { clearPlayer, getPlayer } from 'src/lib/utils.ts'
import { API_URL } from 'src/lib/consts.ts'

import { Button } from 'src/ui/components/button.tsx'

import ModalCreateLobby from 'src/ui/components/modals/ModalCreateLobby'
import ModalLobbiesList from 'src/ui/components/modals/ModalLobbiesList'
import ModalRegister from 'src/ui/components/modals/ModalRegister'
import ModalLogin from 'src/ui/components/modals/ModalLogin'

export default function MainMenu() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showLobbiesModal, setShowLobbiesModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const [player, setPlayer] = useState<ReturnType<typeof getPlayer> | null>(null);

    const handleLogout = () => {
        clearPlayer();
        window.location.reload();
    };

    // const getPlayers = async () => {
    //     const response = await fetch('http://109.73.199.202/players');
    //     const data = await response.json();
    //     console.log(data)
    // }

    useEffect(() => {
        setPlayer(getPlayer());
        fetch(`http://${API_URL}/players`, {method: "GET"});
        // getPlayers()
    }, []);

    return (
        <div className="relative w-full h-full">
            <div className="absolute top-[50px] left-[50px] w-[300px] gap-5 border border-black-200 p-5 flex flex-col">
                {player ? (
                    <div className="flex flex-col gap-4">
                        <div className="text-lg">Привет, {player.name}!</div>
                        <Button variant="outline" onClick={handleLogout}>Выйти из аккаунта</Button>
                    </div>
                ) : (
                    <div className="flex justify-between gap-[20px]">
                        <Button className="grow" variant="outline" onClick={() => setShowLoginModal(true)}>
                            Войти
                        </Button>
                        <Button variant="outline" onClick={() => setShowRegisterModal(true)}>
                            Зарегистрировать
                        </Button>
                    </div>
                )}
                <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                    Создать лобби
                </Button>
                <Button variant="outline" onClick={() => setShowLobbiesModal(true)}>
                    Посмотреть лобби
                </Button>
            </div>
            <img src="./main-menu.gif" className="w-full h-full object-cover" />

            <ModalCreateLobby open={showCreateModal} onOpenChange={setShowCreateModal} />
            <ModalLobbiesList open={showLobbiesModal} onOpenChange={setShowLobbiesModal} />
            <ModalRegister open={showRegisterModal} onOpenChange={setShowRegisterModal} />
            <ModalLogin open={showLoginModal} onOpenChange={setShowLoginModal} />
        </div>
    );
}
