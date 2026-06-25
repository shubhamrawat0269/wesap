import { create } from 'zustand'
import { getSocket } from '../services/chat.service'

const useThemeStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  onlineUsers: new Map(),
  typingUsers: new Map(),

  initsocketListeners: () => {
    const socket = getSocket()
    if (!socket) return

    // remove existing listeners
    socket.off('receive_message')
    socket.off('user_typing')
    socket.off('user_status')
    socket.off('message_send')
    socket.off('message_error')
    socket.off('message_deleted')

    socket.on('receive_message', (message) => {})

    socket.on('message_send', (message) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === message._id ? { ...msg } : msg
        ),
      }))
    })

    socket.on(
      'message_status_update',
      ({ messageId, messageStatus }) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === messageId ? { ...msg, messageStatus } : msg
          ),
        }))
      }
    )

    socket.on('reaction_update', ({ messageId, reactions }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        ),
      }))
    })

    socket.on('message_deleted', ({ deletedMessageId }) => {
      set((state) => ({
        messages: state.messages.filter(
          (msg) => msg._id !== deletedMessageId
        ),
      }))
    })

    socket.on('message_error', (error) => {
      console.error('Message Error', error)
    })
  },
}))

export default useThemeStore
