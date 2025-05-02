import {
    shouldAddFactoryChange,
    shouldAddTownChange,
    // shouldAddUnitChange
} from 'src/store/game-process/game-process.slice'

import { useAppDispatch } from 'src/lib/hooks.ts'

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
import { getPlayer } from 'src/lib/utils.ts'
import { PlayerType } from 'src/lib/types.ts'

export default function GameScreen() {
    const dispatch = useAppDispatch()
    const player = getPlayer() as PlayerType
    const color = player.color

    return (
        <div className='w-full h-full px-2'>
            <div className='h-20 flex items-center px-5 bg-[#cdcac3]'>
                <Menubar>
                    <MenubarMenu>
                        <MenubarTrigger className={`data-[state=open]:bg-${color}-500`}>Строительство</MenubarTrigger>
                        <MenubarContent>
                            <MenubarSub>
                                <MenubarSubTrigger>Поселение</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => dispatch(shouldAddTownChange())}>Город</MenubarItem>
                                    <MenubarSeparator />
                                    <MenubarItem>Деревня</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                            <MenubarSeparator />
                            <MenubarItem onClick={() => dispatch(shouldAddFactoryChange())}>
                                Фабрика
                            </MenubarItem>
                            <MenubarSeparator />
                            <MenubarSub>
                                <MenubarSubTrigger>Военный завод</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem>Танковый завод</MenubarItem>
                                    <MenubarSeparator />
                                    <MenubarItem>Верфь</MenubarItem>
                                    <MenubarSeparator />
                                    <MenubarItem>Авиационный завод</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                        </MenubarContent>
                    </MenubarMenu>
                    <div className='h-full w-[1px] bg-[#cdcac3]' />
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
            </div>
            <HexMap/>
        </div>
    )
}
