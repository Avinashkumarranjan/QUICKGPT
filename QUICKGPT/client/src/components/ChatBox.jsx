import { useState, useEffect, useRef } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets';
import Message from './Message';
import Brand from './Brand';
import toast from 'react-hot-toast';

const ChatBox = () => {
  
  const containerRef = useRef(null);
   
  const { selectedChat, theme, user, axios, token, setUser} = useAppContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished]= useState(false)

  const onSubmit = async(e)=>{
  
    try {
       e.preventDefault()
       if(!user) return toast("Login to send message")
       if (!selectedChat?._id) return toast.error("Please select a chat first")
       const promptCopy = prompt.trim();
       if (!promptCopy) return;
       setLoading(true)
       setPrompt("")
      setMessages(prev => [...prev, { role: "user", content: promptCopy, timestamp:Date.now(), isImage: false}])
      const {data} = await axios.post(`/api/message/${mode}`, {
        chatId: selectedChat._id,
        prompt: promptCopy,
        isPublished
      },{headers: {Authorization: `Bearer ${token}`}})

      if(data.success){
        setMessages(prev => [...prev, data.reply])
        // decrease credits
        if(mode === "image"){
          setUser(prev => ({...prev, credits: prev.credits -2}))
        }else{
          setUser(prev => ({...prev, credits: prev.credits -1}))
        }
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }finally{
      setPrompt("")
      setLoading(false)
    }
  }

  // loading state add kiya
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log("selectedChat:", selectedChat);
    if (selectedChat && selectedChat.messages && Array.isArray(selectedChat.messages)) {
      console.log("Setting messages:", selectedChat.messages);
      setMessages(selectedChat.messages);
    } else {
      console.log("No messages, setting empty array");
      setMessages([]);
    }
  }, [selectedChat]);

  useEffect(() => {
    if(containerRef.current){
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages]);

  return (
    <div className='flex-1 flex flex-col h-full w-full m-5 md:m-10 xl:mx-auto xl:max-w-[1200px] max-md:mt-14'>

      {/* Chat Messages Container */}
      <div ref={containerRef} className='flex-1 mb-5 overflow-y-auto overflow-x-hidden'>
        {messages.length === 0 ? (
          <div className='h-full flex flex-col items-center justify-center gap-2 text-primary px-4'>
            <Brand theme={theme} size="lg" centered />
            <p className='mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white'>
              Ask me Anything.
            </p>
          </div>
        ) : (
          <div className='w-full'>
            {messages.map((message, index) => (
              <Message key={message.id || index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Three Dots Loading */}
        {loading && (
          <div className='flex items-center gap-1.5 my-4'>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce' ></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce' ></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce' ></div>
          </div>
        )}
      </div>
          {mode === "image" && (
            <label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto'>
              <p className='text-xs'>Publish Generated Image to Community</p>
              <input type="checkbox"  className='cursor-pointer' checked={isPublished}
               onChange={(e)=>setIsPublished(e.target.checked)}/>
            </label>
          )}
      {/* Prompt Input Box */}
      <form onSubmit={onSubmit} className='bg-primary/20 dark:bg-[#583c79]/30
       border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl
        p-3 pl-4 mx-auto flex gap-4 items-center'>
        <select onChange={(e)=>setMode(e.target.value)} value={mode} className='text-sm pl-3 pr-2 outline-none'>
          <option className='dark:bg-purple-900' value="text">Text</option>
          <option className='dark:bg-purple-900' value="image">Image</option>
        </select>
        <input onChange={(e)=>setPrompt(e.target.value)} value={prompt} type="text" placeholder='Type your prompt here...' className='flex-1 w-full text-sm
         outline-none' required />
         <button type="submit" aria-label="Send">
          <img src={loading ? assets.stop_icon : assets.send_icon } className='w-8
            cursor-pointer' alt="" />
         </button>
      </form>

    </div>
  );
}

export default ChatBox;
