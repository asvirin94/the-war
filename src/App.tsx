import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import MainMenu from 'src/ui/modules/MainMenu'
import GameScreen from 'src/ui/modules/GameScreen'
import LobbyScreen from 'src/ui/modules/LobbyScreen'

export default function App() {
    return (
        <Router>
            <Routes>
                <Route index element={<MainMenu/>}/>
                <Route path='/lobby/:lobbyId' element={<LobbyScreen />} />
                <Route path='/game/:lobbyId' element={<GameScreen/>}/>
            </Routes>
        </Router>
    )
}
