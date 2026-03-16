import { createSlice, nanoid } from '@reduxjs/toolkit'

// Persist chat UI state so chats don't vanish on refresh
// Build a storage key per user so switching accounts doesn't wipe another user's data
function getCurrentUserKey() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const u = JSON.parse(raw)
    return u?.id || u?._id || u?.email || null
  } catch (_) { return null }
}

function getStorageKey() {
  const uid = getCurrentUserKey()
  return uid ? `chatState:${uid}` : 'chatState:guest'
}

function loadState() {
  try {
    const raw = localStorage.getItem(getStorageKey())
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.chats) && typeof parsed.messagesByChat === 'object') {
      return {
        chats: parsed.chats,
        activeChatId: parsed.activeChatId || parsed.active_id || null,
        messagesByChat: parsed.messagesByChat,
      }
    }
  } catch (_) {}
  return null
}

function saveState(state) {
  try {
    const snapshot = {
      chats: state.chats,
      activeChatId: state.activeChatId || null,
      messagesByChat: state.messagesByChat,
    }
    localStorage.setItem(getStorageKey(), JSON.stringify(snapshot))
  } catch (_) {}
}

const initialState = loadState() || {
  chats: [],
  activeChatId: null,
  messagesByChat: {},
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action) => {
      const list = Array.isArray(action.payload) ? action.payload : []
      // Normalize incoming chats to local shape { id, title }
      const normalized = list.map((c) => ({
        id: c.id || c._id || nanoid(),
        title: (typeof c.title === 'string' && c.title.trim()) ? c.title.trim() : 'New chat',
      }))
      // Try to load persisted messages for the current user and merge
      const persisted = loadState()
      state.chats = normalized
      const map = { ...(persisted?.messagesByChat || {}) }
      for (const c of normalized) map[c.id] = map[c.id] || state.messagesByChat[c.id] || []
      state.messagesByChat = map
      if (!state.activeChatId || !map[state.activeChatId]) {
        // Prefer last active from persisted state
        state.activeChatId = persisted?.activeChatId && map[persisted.activeChatId]
          ? persisted.activeChatId
          : (normalized[0]?.id || null)
      }
      saveState(state)
    },
    createChat: (state, action) => {
      const { _id, id, title } = action.payload || {}
      const chatId = id || _id || nanoid()
      state.chats.unshift({ id: chatId, title: title || 'New chat' })
      // ensure message bucket exists
      state.messagesByChat[chatId] = state.messagesByChat[chatId] || []
      state.activeChatId = chatId
      saveState(state)
    },
    addMessageToChat: (state, action) => {
      const { chatId, role, text, skipSave } = action.payload
      const targetId = chatId || state.activeChatId
      if (!targetId) return
      const msg = { id: nanoid(), role, text }
      const arr = state.messagesByChat[targetId] || []
      
      // Check for duplicate message (same role and text)
      const isDuplicate = arr.some(m => m.role === role && m.text === text)
      if (!isDuplicate) {
        arr.push(msg)
        state.messagesByChat[targetId] = arr
      }
      
      // If first user message, set chat title from it
      const chat = state.chats.find(c => c.id === targetId || c._id === targetId)
      if (chat && chat.title === 'New chat' && role === 'user') {
        chat.title = (text || '').slice(0, 30) || 'New chat'
      }
      // Move active chat to top as most recent (skip for historical message loading)
      if (chat && !skipSave) {
        state.chats = [chat, ...state.chats.filter(c => c.id !== targetId && c._id !== targetId)]
      }
      if (!skipSave) {
        saveState(state)
      }
    },
    setActiveChat: (state, action) => {
      const id = action.payload
      state.activeChatId = id
      // Move the selected chat to the top so the currently active chat is first
      const chat = state.chats.find(c => c.id === id || c._id === id)
      if (chat) {
        state.chats = [chat, ...state.chats.filter(c => (c.id !== id && c._id !== id))]
      }
      saveState(state)
    },
    setChatTitle: (state, action) => {
      const { id, title } = action.payload || {}
      const chat = state.chats.find(c => c.id === id || c._id === id)
      if (chat) {
        const t = (typeof title === 'string' ? title.trim() : '') || 'New chat'
        chat.title = t.slice(0, 60)
      }
      saveState(state)
    },
    resetChats: (state) => {
      state.chats = []
      state.activeChatId = null
      state.messagesByChat = {}
      // Intentionally do NOT remove persisted state; we keep per-user history
    },
  },
})

export const { createChat, addMessageToChat, setActiveChat, setChatTitle, setChats, resetChats } = chatSlice.actions
export default chatSlice.reducer
