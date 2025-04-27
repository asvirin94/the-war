import { useEffect, useState } from 'react'

import { getLobbies } from 'src/lib/utils'

import { Dialog, DialogContent, DialogTitle } from 'src/ui/components/dialog.tsx'
import { Button } from 'src/ui/components/button.tsx'

type GetLobbiesModalType = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ModalLobbiesList({open, onOpenChange}: GetLobbiesModalType) {
    const [isLoading, setIsLoading] = useState(true)
    const [lobbies, setLobbies] = useState([]);

    const fetchLobbies = async () => {
        setIsLoading(true)
        const lobbiesData = await getLobbies();
        setLobbies(lobbiesData);
        setIsLoading(false)
    };

    useEffect(() => {
        if (open) {
            fetchLobbies();
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[400px] bg-[#fff]'>
                <DialogTitle>Список лобби</DialogTitle>
                {isLoading ? (
                    <p>Загружаем</p>
                ) : (
                    lobbies.length === 0 ? (
                        <p>Лобби отсутствуют</p>
                    ) : (
                        <ul>
                            {lobbies.map((lobby) => (
                                <li key={lobby.id} className="flex justify-between p-2">
                                    <span>{lobby.name}</span>
                                    <button
                                        onClick={() => alert(`Присоединились к лобби ${lobby.name}`)}
                                        className="text-blue-500 underline"
                                    >
                                        Присоединиться
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )
                )}
                <Button onClick={fetchLobbies}>Обновить</Button>
            </DialogContent>
        </Dialog>
    )
}
