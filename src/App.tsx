import { BrowserRouter, Route, Routes } from 'react-router-dom'

import MainMenu from 'src/ui/modules/MainMenu'
import GameScreen from 'src/ui/modules/GameScreen'

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route index element={<MainMenu/>}/>
                    <Route path='/game' element={<GameScreen/>}/>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
