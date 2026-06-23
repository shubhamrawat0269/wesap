import React from 'react'
import Layout from '../../components/Layout'
import { motion } from 'framer-motion'
import Chat from '../chats/Chat'

const Home = () => {
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        <Chat />
      </motion.div>
    </Layout>
  )
}

export default Home
