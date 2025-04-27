import { useState } from "react";

import { Button } from 'src/ui/components/button.tsx'

import { ModalCreateLobby } from 'src/ui/components/modals/ModalCreateLobby'
import ModalLobbiesList from 'src/ui/components/modals/ModalLobbiesList'


export default function MainMenu() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showLobbiesModal, setShowLobbiesModal] = useState(false);

    return (
        <div className="relative w-full h-full">
            <div className="absolute top-[50px] left-[50px] w-[240px] gap-5 border border-black-200 p-5 flex flex-col">
                <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                    Создать лобби
                </Button>
                <Button variant="outline" onClick={() => setShowLobbiesModal(true)}>
                    Посмотреть лобби
                </Button>
            </div>
            <img src="/main-menu.gif" className="w-full h-full object-cover" />

            <ModalCreateLobby
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
            />

            <ModalLobbiesList
                open={showLobbiesModal}
                onOpenChange={setShowLobbiesModal}
            />
        </div>
    );
}
