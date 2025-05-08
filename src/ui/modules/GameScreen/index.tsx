import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
    shouldAddFactoryChange,
    shouldAddTownChange,
    // shouldAddUnitChange
} from 'src/store/app-process/app-process.slice.ts'
import { getSocket } from 'src/store/websocket-process/websocket-process.selectors'
import { disconnectSocket } from 'src/store/websocket-process/websocket-process.slice'
import { getEnemies, getPlayer } from 'src/store/game-process/game-process.selectors'

import { useAppDispatch, useAppSelector } from 'src/lib/hooks'
import { getUser, handleLeaveLobby } from 'src/lib/utils'
import { PlayerType, UserType } from 'src/lib/types'

import { Button } from 'src/ui/components/button'
import {
    Menubar,
    MenubarItem,
    MenubarSeparator,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
    MenubarContent,
    MenubarMenu
} from 'src/ui/components/menubar'

import HexMap from 'src/ui/modules/GameScreen/components/HexMap'

export default function GameScreen() {
    const dispatch = useAppDispatch()
    const socket = useAppSelector(getSocket) as WebSocket
    const player = useAppSelector(getPlayer) as PlayerType
    const enemies = useAppSelector(getEnemies) as PlayerType[]

    const navigate = useNavigate()
    const {lobbyId} = useParams<{ lobbyId: string }>();

    const user = getUser() as UserType
    const color = player.color

    useEffect(() => {
        if(!lobbyId && !socket) return;

        const onBeforeUnload = () => {
            void handleLeaveLobby(lobbyId as string, user);
            dispatch(disconnectSocket());
        };
        window.addEventListener('beforeunload', onBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
        };
    }, [])

    if(!lobbyId) return null;

    return (
        <div className='w-full h-full px-2'>
            <div className='h-20 flex items-center gap-5 px-5 bg-[#cdcac3]'>
                <Menubar>
                    <MenubarMenu>
                        <MenubarTrigger className={`data-[state=open]:bg-${color}-500`}>Строительство</MenubarTrigger>
                        <MenubarContent>
                            <MenubarSub>
                                <MenubarSubTrigger>Поселение</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => dispatch(shouldAddTownChange())}>Город</MenubarItem>
                                    <MenubarSeparator/>
                                    <MenubarItem>Деревня</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                            <MenubarSeparator/>
                            <MenubarItem onClick={() => dispatch(shouldAddFactoryChange())}>
                                Фабрика
                            </MenubarItem>
                            <MenubarSeparator/>
                            <MenubarSub>
                                <MenubarSubTrigger>Военный завод</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem>Танковый завод</MenubarItem>
                                    <MenubarSeparator/>
                                    <MenubarItem>Верфь</MenubarItem>
                                    <MenubarSeparator/>
                                    <MenubarItem>Авиационный завод</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                        </MenubarContent>
                    </MenubarMenu>
                    <div className='h-full w-[1px] bg-[#cdcac3]'/>
                    <MenubarMenu>
                        <MenubarTrigger className={`data-[state=open]:bg-${color}-500`}>Создать отряд</MenubarTrigger>
                        <MenubarContent>
                            {/*<MenubarItem onClick={() => dispatch(shouldAddUnitChange())}>*/}
                            <MenubarItem>
                                Танковый полк
                            </MenubarItem>
                            <MenubarSeparator/>
                            <MenubarItem>
                                Авиационный полк
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
                <Button onClick={() => {
                    handleLeaveLobby(lobbyId, user);
                    dispatch(disconnectSocket())
                    navigate('/');
                }}>
                    Покинуть игру :(
                </Button>
            </div>
            <HexMap socket={socket} player={player} enemies={enemies} />
        </div>
    )
}
