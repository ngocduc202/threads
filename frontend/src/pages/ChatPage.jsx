import { SearchIcon } from '@chakra-ui/icons'
import { Box, Button, Divider, Flex, Input, Skeleton, SkeletonCircle, Text, useColorModeValue } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { GiConversation } from 'react-icons/gi'
import Conversation from '../components/Conversation'
import MessageContainer from '../components/MessageContainer'
import useShowToast from '../hooks/useShowToast'
import { useRecoilState, useRecoilValue } from 'recoil'
import { conversationsAtom, selectedConversationAtom } from '../atoms/messagesAtom'
import userAtom from '../atoms/userAtom'
import { useSocket } from '../context/SocketContext'
import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

const ChatPage = () => {

  const showToast = useShowToast()
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [conversations, setConversations] = useRecoilState(conversationsAtom)
  const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom)
  const [searchText, setSearchText] = useState("")
  const [searchingUser, setSearchingUser] = useState(false)
  const currentUser = useRecoilValue(userAtom)
  const { socket, onlineUsers } = useSocket()

  useEffect(() => {
    socket?.on("messageSeen", ({ conversationId }) => {
      setConversations(prev => {
        const updatedConversations = prev.map(conversation => {
          if (conversation?._id === conversationId) {
            return {
              ...conversation,
              lastMessage: {
                ...conversation.lastMessage,
                seen: true
              }
            }
          }
          return conversation
        })
        return updatedConversations
      })
    })
  }, [socket, setConversations])


  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await fetch("/api/messages/conversations")
        const data = await res.json()
        if (data.error) {
          showToast("Error", data.error, "error")
          return
        }
        setConversations(data)
      } catch (error) {
        showToast("Error", error.message, "error")
      } finally {
        setLoadingConversations(false)
      }
    }

    getConversations()
  }, [showToast, setConversations])

  const handleConversationSearch = async (e) => {
    e.preventDefault()
    setSearchingUser(true)
    try {
      const res = await fetch(`/api/users/profile/${searchText}`)
      const searchedUser = await res.json()
      if (searchedUser.user.error) {
        showToast("Error", searchedUser.error, "error")
        return
      }

      const messagingYourself = searchedUser?.user?._id === currentUser?._id
      if (messagingYourself) {
        showToast("Error", "You can't message yourself", "error")
        return
      }

      const conversationAlreadyExists = conversations?.find(conversation => conversation.participants[0]._id === searchedUser?.user?._id)
      if (conversationAlreadyExists) {
        setSelectedConversation({
          _id: conversationAlreadyExists?._id,
          userId: searchedUser?.user?._id,
          username: searchedUser?.user?.username,
          userProfilePic: searchedUser?.user?.profilePic
        })
        return
      }

      const mockConversation = {
        mock: true,
        lastMessage: {
          text: "",
          sender: ""
        },
        _id: Date.now(),
        participants: [
          {
            _id: searchedUser?.user?._id,
            username: searchedUser?.user?.username,
            profilePic: searchedUser?.user?.profilePic
          }
        ]
      }

      setConversations((prevConversations) => [...prevConversations, mockConversation])
    } catch (error) {
      showToast("Error", error.message, "error")
    } finally {
      setSearchingUser(false)
    }
  }
  return (
    <Box position={'absolute'}
      left={'50%'}
      w={{
        base: "100%",
        md: "80%",
        lg: "750px",
      }}
      p={4}
      transform={"translateX(-50%)"}
      mt={{ base: "1", md: "6" }}
    >
      <Flex
        gap={4}
        flexDirection={{
          base: "column",
          md: "row",
        }}
        maxW={{
          base: "full",
          md: "full",
        }}
        mx={'auto'}
      >
        <Flex flex={30}
          gap={2}
          flexDirection={"column"}
          maxW={{
            base: "full",
            md: "full",
          }}
          mx={{ base: "0", md: "auto" }}
        >
          <Flex gap={2} alignItems={"center"}>
            <Box display={{ base: "block", md: "none" }}>
              <Link to='/'>
                <FaArrowLeft size={20} />
              </Link>
            </Box>
            <Text fontWeight={700} color={useColorModeValue("gray.600", "gray.400")}>
              Your Conversations
            </Text>
          </Flex>
          <form onSubmit={handleConversationSearch}>
            <Flex alignItems={"center"} gap={2}>
              <Input placeholder='Search for a user' onChange={(e) => setSearchText(e.target.value)} value={searchText} />
              <Button size={"sm"} onClick={handleConversationSearch} isLoading={searchingUser}>
                <SearchIcon />
              </Button>
            </Flex>
          </form>
          {loadingConversations && (
            [0, 1, 2, 3, 4].map((_, i) => (
              <Flex key={i} gap={4} alignItems={"center"} p={1} borderRadius={'md'}>
                <Box>
                  <SkeletonCircle size="10" />
                </Box>
                <Flex w={"full"} flexDirection={"column"} gap={3}>
                  <Skeleton h={'10px'} w={'80px'} />
                  <Skeleton h={'8px'} w={'90%'} />
                </Flex>
              </Flex>
            ))
          )}
          <Box maxH={{ base: "100px", md: "600px" }} overflowY={"auto"} >
            {!loadingConversations && (
              conversations?.map((conversation) => (
                <Conversation key={conversation._id} isOnline={onlineUsers?.includes(conversation?.participants[0]?._id)} conversation={conversation} />
              ))
            )}
          </Box>
          <Divider bg='gray.light' mt={1} display={{ base: "block", md: "none" }} />
        </Flex>
        {!selectedConversation._id && (
          <Flex
            flex={70}
            borderRadius={"md"}
            p={2}
            flexDir={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            height={"400px"}
          >
            <GiConversation size={100} />
            <Text fontSize={20}>Select a conversation to start messaging</Text>
          </Flex>
        )}

        {selectedConversation?._id && (
          <MessageContainer />
        )}
      </Flex>
    </Box>
  )
}

export default ChatPage