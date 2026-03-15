/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loadingUser, setLoadingUser] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/user/data", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setUser(data.user);
            } else {
                // Token invalid/expired -> clear it so login page doesn't keep spamming network/auth errors.
                setToken(null);
                localStorage.removeItem("token");
                setUser(null);
                setChats([]);
                setSelectedChat(null);
                toast.error(data.message);
            }
        } catch (error) {
            // Network error or unauthorized -> clear token to avoid repeated failing requests on reload.
            const status = error?.response?.status;
            const isNetworkError = !error?.response;

            if (isNetworkError || status === 401 || status === 403) {
                setToken(null);
                localStorage.removeItem("token");
                setUser(null);
                setChats([]);
                setSelectedChat(null);
            }

            if (isNetworkError) {
                toast.error("Backend not reachable. Start it (QUICKGPT/start-backend.cmd) on http://localhost:3000.");
            } else {
                toast.error(error.response?.data?.message || error.message);
            }
        } finally {
            setLoadingUser(false);
        }
    }, [token]);

    const logout = () => {
        setToken(null);
        localStorage.removeItem("token");
        setUser(null);
        setChats([]);
        setSelectedChat(null);
        navigate("/");
    };

    const fetchUsersChats = useCallback(async (createIfEmpty = true) => {
        try {
            const { data } = await axios.get("/api/chat/get", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setChats(data.chats);

                if (data.chats.length === 0 && createIfEmpty) {
                    await axios.post("/api/chat/create", {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    await fetchUsersChats(false);
                } else if (data.chats.length > 0) {
                    setSelectedChat(data.chats[0]);
                } else {
                    setSelectedChat(null);
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }, [token]);

    const createNewChat = async () => {
        try {
            if (!user) return toast("Please login to create a chat");

            navigate("/");

            await axios.post("/api/chat/create", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await fetchUsersChats();
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        if (user) {
            fetchUsersChats();
        } else {
            setChats([]);
            setSelectedChat(null);
        }
    }, [user, fetchUsersChats]);

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setUser(null);
            setLoadingUser(false);
        }
    }, [token, fetchUser]);

    const value = {
        navigate,
        user,
        setUser,
        fetchUser,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        theme,
        setTheme,
        createNewChat,
        loadingUser,
        fetchUsersChats,
        token,
        setToken,
        axios,
        logout
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
