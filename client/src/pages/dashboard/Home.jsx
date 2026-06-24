import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { motion } from 'framer-motion'
import Chat from '../chats/Chat'
import { getAllUsers } from '../../services/user.service'

const Home = () => {
  const [allUsers, setAllUsers] = useState([])

  const getAllUser = async () => {
    try {
      const result = await getAllUsers()
      if (result.status === 'success') {
        setAllUsers(result.data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getAllUser()
  }, [])

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        <Chat contacts={allUsers} />
      </motion.div>
    </Layout>
  )
}

export default Home
