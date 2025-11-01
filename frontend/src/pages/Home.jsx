import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createChat, setActiveChat, addMessageToChat, setChatTitle , setChats } from '../store/chatSlice'
import SidebarContent from '../components/chat/SidebarContent'
import ChatHeader from '../components/chat/ChatHeader'
import ChatMessages from '../components/chat/ChatMessages'
import ChatComposer from '../components/chat/ChatComposer'
import axios from 'axios'
import { io } from "socket.io-client"
import { useNavigate } from 'react-router-dom'

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

const Home = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const chats = useSelector(state => state.chat.chats)
  const activeChatId = useSelector(state => state.chat.activeChatId)
  const messagesByChat = useSelector(state => state.chat.messagesByChat)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // User input
  const [input, setInput] = useState('')
  // Socket state
  const [Socket, setSocket] = useState(null)
  
  // Check authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false)


  // Derived state
  const messages = useMemo(() => messagesByChat[activeChatId] || [], [messagesByChat, activeChatId])
  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId])

  // Refs
  const endRef = useRef(null)

  // Auto-scroll when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeChatId])

  // Check if user is authenticated
  useEffect(() => {
    try {
      const user = localStorage.getItem('user')
      if (!user) {
        navigate('/register')
        return
      }
      setIsAuthenticated(true)
    } catch (error) {
      navigate('/register')
    }
  }, [navigate])

  // Base API URL (set via Vite env variable in production).
  // Fallback to same origin (useful when frontend is served from the backend host).
  const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

  // Hydrate chats from backend on mount (after login/route change)
  useEffect(() => {
    if (!isAuthenticated) return
    axios.get(`${API_BASE}/chat/`, { withCredentials: true })
      .then((res) => {
        dispatch(setChats(res.data.chats))
      })
      .catch((error) => {
        console.error('Error fetching chats:', error)
        if (error.response?.status === 401) {
          localStorage.removeItem('user')
          navigate('/register')
        }
      })

      const tempSocket = io(API_BASE,{
        withCredentials: true,
      });

      tempSocket.on("ai-response", (message) => {
        console.log("Received AI response :",message);
        dispatch(addMessageToChat({ chatId: message.chat, role: 'model', text: message.content }));
      })
      
      setSocket(tempSocket);
  }, [isAuthenticated])

  const createNewChat =  async () => {
    // Check authentication
    if (!isAuthenticated) {
      navigate('/register')
      return
    }

    // Prompt for a session name first
    const name = window.prompt('Name this chat session', 'New chat')
    const title = (name && name.trim()) ? name.trim() : 'New chat'

    try {
      // Also create chat on the server (requires auth cookie)
  const res = await axios.post(`${API_BASE}/chat/`, { title }, { withCredentials: true })

      console.log('New chat created on server:', res.data.chat)

      // Create chat locally (Redux) with the given title and activate it
      dispatch(createChat(res.data.chat))
      
      setDrawerOpen(false)
    } catch (error) {
      console.error('Error creating chat:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('user')
        navigate('/register')
      }
    }
  }

  const getMessages = async (chatId) => {
    try {
      const res = await axios.get(`${API_BASE}/chat/${chatId}/messages`, { 
        withCredentials: true 
      })
      console.log('Fetched messages for chat:', chatId, res.data.messages)
      
      // Load messages into Redux for this chat (one by one to maintain order)
      res.data.messages.forEach(msg => {
        dispatch(addMessageToChat({ 
          chatId: chatId, 
          role: msg.role, 
          text: msg.content,
          skipSave: true // Flag to avoid moving chat to top for historical messages
        }))
      })
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const switchChat = (id) => {
    dispatch(setActiveChat(id))
    // Fetch messages for the selected chat if not already loaded
    if (!messagesByChat[id] || messagesByChat[id].length === 0) {
      getMessages(id)
    }
    setDrawerOpen(false)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    
    // Check authentication
    if (!isAuthenticated) {
      navigate('/register')
      return
    }

    const text = input.trim()
    console.log("sendMessage:", text);
    
    if (!text) return

    // Add user message to redux
    dispatch(addMessageToChat({ chatId: activeChatId, role: 'user', text }))
    setInput('')

    // Send message to AI via socket
    if (Socket && activeChatId) {
      Socket.emit("ai-message", {
        chatId: activeChatId,
        content: text
      })
    }
  }

  // Components imported above will render sidebar, header, messages and composer

  // Don't render until authentication is checked
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="chat-layout">
      {/* Sidebar (desktop) */}
      <aside className="chat-sidebar">
        <SidebarContent
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={createNewChat}
          onSwitchChat={switchChat}
        />
      </aside>

      {/* Main chat area */}
  <section className={`chat-main ${messages.length === 0 ? 'landing' : ''}`}>
        {/* Mobile top bar with hamburger */}
        <div className="chat-mobilebar">
          <button className="hamburger" onClick={() => setDrawerOpen(true)}>☰</button>
          <div className="chat-brand">ChatGPT</div>
        </div>

        {messages.length === 0 ? (
          // Landing state: desktop has centered hero with composer; mobile has composer pinned at bottom
          <>
            <div className="landing-hero">
              <h1 className="landing-title">What are you working on?</h1>
              <div className="landing-composer show-desktop">
                <ChatComposer
                  input={input}
                  setInput={setInput}
                  onSubmit={sendMessage}
                  variant="landing"
                /> 
              </div>
            </div>
            <div className="show-mobile">
              <ChatComposer input={input} setInput={setInput} onSubmit={sendMessage} />
            </div>
          </>
        ) : (
          // Conversation state (image2 style)
          <>
            <ChatHeader title={activeChat?.title || 'Chat'} />
            <ChatMessages messages={messages} endRef={endRef} />
            <ChatComposer input={input} setInput={setInput} onSubmit={sendMessage} />
          </>
        )}
  </section>

      {/* Mobile drawer */}
      <div className={`drawer ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)}>
        <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
          <SidebarContent
            chats={chats}
            activeChatId={activeChatId}
            onNewChat={createNewChat}
            onSwitchChat={switchChat}
          />
        </div>
      </div>
    </div>
  )
}

export default Home
