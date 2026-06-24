import { useState } from 'react'
import useLayoutStore from '../../store/useLayoutStore'
import useThemeStore from '../../store/useThemeStore'
import useUserStore from '../../store/useUserStore'

const Chat = ({ contacts }) => {
  const setSelectedContact = useLayoutStore(
    (state) => state.setSelectedContact
  )

  const selectedContact = useLayoutStore(
    (state) => state.selectedContact
  )
  const { theme } = useThemeStore()
  const { user } = useUserStore()

  const [searchTerms, setSearchTerms] = useState('')
  const filteredContacts = contacts?.filter((contact) =>
    contact?.username
      ?.toLowerCase()
      .includes(searchTerms.toLowerCase())
  )

  return (
    <div
      className={`w-full border-r h-screen ${theme == 'dark' ? 'bg-[rgb(17,27,33)] border-gray-600' : 'bg-white border-gray-200'}`}
    >
      <div
        className={`p-4 flex justify-between ${theme == 'dark' ? 'text-white' : 'text-gray-800'}`}
      >
        <h2 className="text-xl font-semibold">Chats</h2>
      </div>
    </div>
  )
}

export default Chat
