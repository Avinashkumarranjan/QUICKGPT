import { useState } from 'react'
import Sidebar from './components/Sidebar'
import { Route, Routes, useLocation } from 'react-router-dom'
import ChatBox from './components/ChatBox'
import Credits from './pages/Credits'
import Community from './pages/Community'
import { assets } from './assets/assets'
import { useAppContext } from './context/AppContext'
import "./assets/prism.css"
import Loading from './pages/loading'
import Login from './pages/login'

const App = () => {
  const { user, theme } = useAppContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const { pathname } = useLocation()

  if (pathname === "/loading") return <Loading />

  // ✅ User nahi hai toh sirf Login page dikhao — koi extra wrapper nahi
  if (!user) {
    return (
      <div className='bg-gradient-to-b from-[#242124] to-[#000000] flex items-center justify-center min-h-screen w-screen'>
        <Login />
      </div>
    )
  }

  // ✅ Menu icon sirf logged-in state mein dikhao
  return (
    <div className={`min-h-screen w-full ${theme === 'dark' ? 'bg-gradient-to-b from-[#242124] to-[#000000] text-white' : 'bg-gradient-to-b from-[#f5f5f5] to-[#ffffff] text-black'} transition-all duration-500`}>
      {!isMenuOpen && (
        <img
          src={assets.menu_icon}
          alt="Menu"
          className={`absolute top-3 left-3 w-4 h-8 cursor-pointer md:hidden z-50 ${theme === 'light' ? 'invert' : ''}`}
          onClick={() => setIsMenuOpen(true)}
        />
      )}
      <div className='flex h-screen w-full overflow-hidden'>
        <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <main className='flex-1 overflow-y-auto'>
          <Routes>
            <Route path="/" element={<ChatBox />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App