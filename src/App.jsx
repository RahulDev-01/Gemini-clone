import { useContext, useEffect } from 'react'
import { Context } from './context/Context'

import './App.css'
import Sidebar from './components/Sidebar/Sidebar'
import Main from './components/Main/Main'

function App() {
    const { theme } = useContext(Context);

    useEffect(() => {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
    }, [theme]);

    return (
        <>
            <Sidebar />
            <Main />
        </>
    )
}

export default App
