import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Loading = () =>{
    
    const navigate = useNavigate()
    const { search } = useLocation()
    const { axios, token, fetchUser, fetchUsersChats } = useAppContext()

    useEffect(()=>{
      const run = async () => {
        const params = new URLSearchParams(search)
        const checkout = params.get("checkout")
        const sessionId = params.get("session_id")

        if (checkout === "cancelled") {
          navigate("/credits", { replace: true })
          return
        }

        if (checkout === "success" && sessionId) {
          try {
            await axios.get(`/api/credit/verify?session_id=${encodeURIComponent(sessionId)}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          } catch {
            // If webhook has already processed (or verification fails), still try refreshing user.
          }

          try {
            await fetchUser()
            await fetchUsersChats(false)
            toast.success("Credits updated")
          } catch {
            // ignore
          }

          navigate("/", { replace: true })
          return
        }

        const timeout = setTimeout(() => {
          navigate("/", { replace: true })
        }, 1500)

        return () => clearTimeout(timeout)
      }

      void run()
    }, [axios, token, fetchUser, fetchUsersChats, navigate, search]);
    return (
        <div className="bg-gradient-to-b from-[#531B81] to-[#29184B] backdrop-opacity-60 flex items-center justify-center h-screen w-screen">
           <div className="w-10 h-10 rounded-full border-4 border-white 
            border-t-transparent animate-spin">

           </div>
        </div>
    )
}

export default Loading
