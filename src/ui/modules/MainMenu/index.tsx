import { Link } from 'react-router-dom'

import { Button } from 'src/ui/components/button.tsx'

export default function MainMenu() {
    return(
        <div className='relative w-full h-full'>
            <div className='absolute top-[50px] left-[50px] w-[240px] gap-5 border border-black-200 p-5 flex flex-col'>
                <Button variant='outline'>
                    <Link to='/game'>Создать лобби</Link>
                </Button>
                <Button variant='outline'>Присоединиться к лобби</Button>
            </div>
            <img src='/main-menu.gif' className='w-full h-full object-cover' />
        </div>
    )
}
