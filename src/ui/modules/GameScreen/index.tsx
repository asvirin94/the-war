import { shouldAddFactoryChange, shouldAddUnitChange } from 'src/store/game-process/game-process.slice'

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

export default function GameScreen() {
    const dispatch = useAppDispatch()

    return (
        <div className='w-full h-full'>
            <div className='h-20 flex items-center px-5 bg-[#cdcac3]'>
                <Menubar>
                    <MenubarMenu>
                        <MenubarTrigger>Строительство</MenubarTrigger>
                        <MenubarContent>
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
                        <MenubarTrigger>Создать отряд</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={() => dispatch(shouldAddUnitChange())}>
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
