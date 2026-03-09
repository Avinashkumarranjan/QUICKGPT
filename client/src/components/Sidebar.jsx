import React, {useState} from 'react'
import { useAppContext } from '../context/AppContext'
import {assets} from "../assets/assets"
import moment from "moment";

const Sidebar = ({isMenuOpen, setIsMenuOpen}) => {
  const {chats, setSelectedChat, theme, setTheme, navigate, user,} = useAppContext();
  const [search, setSearch] = useState('');

  return (
    <div className={`flex flex-col h-screen min-w-72 p-4 transition-all duration-500 max-md:absolute left-0 z-10 border-r
    ${theme === 'dark' 
      ? 'bg-gradient-to-b from-[#242124]/30 to-[#000000]/30 border-[#80609F]/30 backdrop-blur-3xl text-white' 
      : 'bg-white border-gray-200 text-black'} ${!isMenuOpen && 'max-md:-translate-x-full'}`}>
      
      {/* Logo */}
      <img src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark} alt="Logo"
      className='w-full max-w-40 mb-4'/>

      {/* New Chat Button */}
        <button onClick={() => {setSelectedChat(null); setSearch('')}} 
        className='flex justify-center items-center w-full py-2
        text-white bg-gradient-to-r from-[#8037ce] to-[#3D81F6] text-xs font-medium rounded-md
        cursor-pointer hover:opacity-90 transition-all active:scale-95'>
          <span className='mr-2 text-base'>+</span> New Chat
        </button>

      {/* Search Conversations */}
      <div className={`flex items-center gap-2 px-3 py-2 mt-3 border rounded-md transition-all ${
        theme === 'dark'
          ? 'border-white/20 bg-white/5'
          : 'border-gray-300 bg-gray-50'
      }`}>
      <img src={assets.search_icon} className={`w-4 h-4 flex-shrink-0 ${theme === 'light' ? 'invert' : 'opacity-60'}`} alt='search'/>
      <input 
        onChange={(e)=>setSearch(e.target.value)} 
        value={search} 
        type="text" 
        placeholder='search conversations' 
        className={`text-xs w-full outline-none bg-transparent ${
          theme === 'dark' 
            ? 'placeholder:text-gray-500 text-white' 
            : 'placeholder:text-gray-400 text-black'
        }`}
      />
      </div>

      {/* Recent Chats Label */}
        {chats.length > 0 && <p className={`mt-2 mb-1.5 text-[11px] font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Recent Chats</p>}
      
      {/* Middle Section - Scrollable Chats */}
        <div className="flex-1 overflow-y-auto pr-2 -mx-1">
          <div className={`space-y-2 text-xs ${chats.length === 0 ? 'text-center text-gray-500 pt-4' : ''}`}>
         {chats.length === 0 ? (
           <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>No chats yet</p>
         ) : (
           chats.filter((chat)=> 
             chat.messages[0] 
               ? chat.messages[0]?.content.toLowerCase().includes(search.toLowerCase()) 
               : chat.name.toLowerCase().includes(search.toLowerCase())
           ).map((chat)=>(
              <div 
                key={chat._id} 
                className={`p-2 px-3 border rounded-md cursor-pointer
                flex justify-between items-start group transition-all hover:scale-102 ${
                  theme === 'dark'
                    ? 'bg-[#57317C]/10 border-[#80609F]/20 hover:bg-[#57317C]/20'
                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                }`} 
                onClick={() => setSelectedChat(chat)}
              >
                <div className='flex-1 min-w-0'>
                  <p className={`truncate font-medium ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    {chat.messages.length > 0 ? chat.messages[0].content.slice(0, 32) : chat.name}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    theme === 'dark' ? 'text-[#B1A6C0]' : 'text-gray-500'
                  }`}>
                    {moment(chat.updatedAt).fromNow()}
                  </p>
                </div>
                <img 
                  src={assets.bin_icon} 
                  className={`hidden group-hover:block w-3.5 h-3.5 flex-shrink-0 ml-2 ${
                    theme === 'light' ? 'invert opacity-60' : 'opacity-70'
                  }`} 
                  alt="delete"
                />
              </div>
            ))
         )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto space-y-2">
        {/* Community Images */}
        <div 
          onClick={()=> {navigate("/community")}} 
          className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-all hover:scale-105 ${
            theme === 'dark'
              ? 'border-white/15 hover:bg-[#57317C]/10'
              : 'border-gray-300 hover:bg-gray-100'
          }`}
        >
          <img src={assets.gallery_icon} className={`w-4 h-4 flex-shrink-0 ${theme === 'light' ? 'invert' : ''}`} alt="gallery" />
          <div className='flex flex-col text-sm'>
            <p className='font-medium'>Community Images</p>
          </div>
        </div>

        {/* Credits */}
        <div 
          onClick={()=> {navigate("/credits")}} 
          className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-all hover:scale-105 ${
            theme === 'dark'
              ? 'border-white/15 hover:bg-[#57317C]/10'
              : 'border-gray-300 hover:bg-gray-100'
          }`}
        >
          <img src={assets.diamond_icon} className={`w-4 h-4 flex-shrink-0 ${theme === 'light' ? 'invert' : ''}`} alt="credits" />
          <div className='flex flex-col text-sm flex-1'>
            <p className='font-medium'>Credits: {user?.credits || 0}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Purchase credits</p>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className={`flex items-center justify-between p-3 border rounded-md ${
          theme === 'dark'
            ? 'border-white/15'
            : 'border-gray-300 bg-gray-50'
        }`}>
          <div className='flex items-center gap-2'>
            <img src={assets.theme_icon} className={`w-4 h-4 ${theme === 'light' ? 'invert' : ''}`} alt="theme"/>
            <p className='text-sm font-medium'>Dark Mode</p>
          </div>
          <label className='relative inline-flex cursor-pointer'>
            <input  
              onChange={()=> setTheme(theme === "dark" ? "light" : "dark")} 
              type='checkbox' 
              className='sr-only peer' 
              checked={theme === "dark"}
            />
            <div className='w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-purple-600 transition-all' />
            <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4' />
          </label>
        </div>

        {/* User Account */}
        <div  
          className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer group transition-all ${
            theme === 'dark'
              ? 'border-white/15 hover:bg-[#57317C]/10'
              : 'border-gray-300 hover:bg-gray-100'
          }`}
        >
          <img src={assets.user_icon} className='w-7 h-7 rounded-full flex-shrink-0' alt="user" />
          <p className={`flex-1 text-sm truncate ${theme === 'dark' ? 'text-primary' : 'text-gray-800'}`}>
            {user ? user.name : "Login your account"}
          </p>
          {user && <img src={assets.logout_icon} className={`w-5 h-5 hidden group-hover:block flex-shrink-0 ${theme === 'light' ? 'invert' : ''}`} alt="logout"/>}
        </div>
      </div>

      {/* Close button for mobile */}
      <img 
        onClick={()=> setIsMenuOpen(false)} 
        src={assets.close_icon} 
        className={`absolute top-5 right-5 w-5 h-5 cursor-pointer md:hidden ${
          theme === 'light' ? 'invert' : ''
        }`} 
        alt="close" 
      />
    </div>
  )
}

export default Sidebar 