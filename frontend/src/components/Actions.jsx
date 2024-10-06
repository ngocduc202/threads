import { Avatar, Box, Button, Divider, Flex, FormControl, Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import React, { useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import userAtom from '../atoms/userAtom'
import useShowToast from '../hooks/useShowToast'
import postsAtom from '../atoms/postAtom';
import { formatDistanceToNow } from 'date-fns';

const Actions = ({ post }) => {
  const user = useRecoilValue(userAtom)
  const showToast = useShowToast()
  const [liked, setLiked] = useState(post?.likes.includes(user?._id))
  const [posts, setPosts] = useRecoilState(postsAtom)
  const [reply, setReply] = useState("")
  const [isReplying, setIsReplying] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [userPost, setUserPost] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()


  const handleLikeAndUnlike = async () => {
    if (!user) return showToast("Error", "Please login to like a post", "error")
    if (isLiking) return

    setIsLiking(true)
    try {
      const res = await fetch(`/api/posts/like/${post._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await res.json()
      if (data.error) {
        showToast("Error", data.error, "error")
        return
      }
      if (!liked) {
        const updatedPosts = posts.map(p => {
          if (p._id === post._id) {
            return { ...p, likes: [...p.likes, user._id] }
          }
          return p
        })
        setPosts(updatedPosts)
      } else {
        const updatedPosts = posts.map(p => {
          if (p._id === post._id) {
            return { ...p, likes: p.likes.filter(l => l !== user._id) }
          }
          return p
        })
        setPosts(updatedPosts)
      }

      setLiked(!liked)
    } catch (error) {
      showToast("Error", error.message, "error")
    } finally {
      setIsLiking(false)
    }
  }

  const handleReply = async () => {
    if (!user) return showToast("Error", "Please login to reply to a post", "error")
    if (isReplying) return
    setIsReplying(true)
    try {
      const res = await fetch(`/api/posts/reply/${post._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: reply }),
      })
      const data = await res.json()
      if (data.error) {
        showToast("Error", data.error, "error")
      }
      const updatedPosts = posts.map(p => {
        if (p._id === post._id) {
          return { ...p, replies: [...p.replies, data] }
        }
        return p
      })
      setPosts(updatedPosts)
      showToast("Success", "Reply posted successfully", "success")
      onClose()
      setReply("")
    } catch (error) {
      showToast("Error", error.message, "error")
    } finally {
      setIsReplying(false)
    }
  }


  const getUser = async () => {
    try {
      const res = await fetch(`/api/users/profile/${post?.postedBy}`)
      const data = await res.json()
      if (data.error) {
        showToast("Error", data.error, "error")
        return
      }
      setUserPost(data.user)
    } catch (error) {
      showToast("Error", error.message, "error")
      setUserPost(null)
    }
  }



  return (
    <Flex flexDirection={"column"}>
      <Flex gap={3} my={2} onClick={(e) => e.preventDefault()}>
        <svg
          aria-label='Like'
          color={liked ? "rgb(237, 73, 86)" : ""}
          fill={liked ? "rgb(237, 73, 86)" : "transparent"}
          height='19'
          role='img'
          viewBox='0 0 24 22'
          width='20'
          cursor={"pointer"}
          onClick={handleLikeAndUnlike}
        >
          <path
            d='M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z'
            stroke='currentColor'
            strokeWidth='2'
          ></path>
        </svg>

        <svg aria-label='Comment' color='' fill='' height='20' role='img' viewBox='0 0 24 24' width='20'
          onClick={() => {
            onOpen()
            getUser()
          }}
          cursor={"pointer"}
        >
          <title>Comment</title>
          <path
            d='M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z'
            fill='none'
            stroke='currentColor'
            strokeLinejoin='round'
            strokeWidth='2'
          ></path>
        </svg>

        <RepostSVG />
        <ShareSVG />
      </Flex>
      <Flex gap={2} alignItems={"center"}>
        <Text color={"gray.light"} fontSize={"sm"}>{post?.replies.length} Replies</Text>
        <Box w={0.5} h={0.5} bg={"gray.light"} borderRadius={"full"}></Box>
        <Text color={"gray.light"} fontSize={"sm"}>{post?.likes.length} Likes</Text>
      </Flex>


      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius={{ base: "none", md: "2xl" }} border={{ base: "none", md: "1px" }} borderColor={{ base: "none", md: "gray.600" }} bg={useColorModeValue("gray.200", "gray.dark")} w={"full"}>
          <ModalHeader textAlign={"center"} p={3} fontSize={"lg"} >Thread Reply</ModalHeader>
          <ModalCloseButton />
          <Divider my={1} />
          <ModalBody pb={6}>
            <Box h={"full"} w={"full"} display={"flex"} flexDirection={"column"} >
              <Flex gap={3} textAlign={"left"} >
                <Avatar name={userPost?.username} src={userPost?.profilePic} size={"md"} />
                <Box>
                  <Flex alignItems={"center"} gap={3}>
                    <Text fontWeight={"bold"}>{userPost?.username}</Text>
                    {userPost?.createdAt && <Text fontSize={"xs"} w={36} color={"gray.light"}>{formatDistanceToNow(new Date(userPost?.createdAt))} ago</Text>}
                  </Flex>
                  <Text>{post?.text}</Text>
                  {post?.img && (
                    <Image src={post?.img} alt='post img' borderRadius={"xl"} w={"400px"} h={"200px"} mt={3} />
                  )}
                </Box>
              </Flex>
              <Divider my={3} />
              <Flex gap={3} mt={2} textAlign={"left"}>
                <Avatar src={user?.profilePic} name={user?.name} size={"md"} />
                <FormControl>
                  <Flex justifyContent={"center"} flexDirection={"column"} >
                    <Text ml={1} fontSize={"sm"} color={"light.800"}>
                      <b>{user?.username}</b>
                    </Text>
                    <Input
                      placeholder={`Reply to ${userPost?.username}...`}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      border={"none"}
                      _focusVisible={{ outline: "none" }}
                      p={1}
                    />
                  </Flex>
                  <Button size={"lg"} onClick={() => setShowEmojiPicker((prev) => !prev)} bg={"none"} _hover={"none"} display={{ base: "none", md: "block" }} >
                    😊
                  </Button>
                </FormControl>
              </Flex>
            </Box>

          </ModalBody>

          <ModalFooter display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
            <Text fontSize={"md"} color={"gray.500"}>
              Anyone can reply & quote
            </Text>
            <Button colorScheme='black' size={"sm"} mr={3} isLoading={isReplying} onClick={handleReply} _hover={{ opacity: ".8" }} border={"1px solid gray"} borderRadius={"lg"} px={5} py={5}>
              <Text fontWeight={"bold"} color={"white"} textAlign={"center"}>
                Reply
              </Text>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>


  );
}

export default Actions

const RepostSVG = () => {
  return (
    <svg
      aria-label='Repost'
      color='currentColor'
      fill='currentColor'
      height='20'
      role='img'
      viewBox='0 0 24 24'
      width='20'
      cursor={"pointer"}
    >
      <title>Repost</title>
      <path
        fill=''
        d='M19.998 9.497a1 1 0 0 0-1 1v4.228a3.274 3.274 0 0 1-3.27 3.27h-5.313l1.791-1.787a1 1 0 0 0-1.412-1.416L7.29 18.287a1.004 1.004 0 0 0-.294.707v.001c0 .023.012.042.013.065a.923.923 0 0 0 .281.643l3.502 3.504a1 1 0 0 0 1.414-1.414l-1.797-1.798h5.318a5.276 5.276 0 0 0 5.27-5.27v-4.228a1 1 0 0 0-1-1Zm-6.41-3.496-1.795 1.795a1 1 0 1 0 1.414 1.414l3.5-3.5a1.003 1.003 0 0 0 0-1.417l-3.5-3.5a1 1 0 0 0-1.414 1.414l1.794 1.794H8.27A5.277 5.277 0 0 0 3 9.271V13.5a1 1 0 0 0 2 0V9.271a3.275 3.275 0 0 1 3.271-3.27Z'
      ></path>
    </svg>
  )
}

const ShareSVG = () => {
  return (
    <svg
      aria-label='Share'
      color=''
      fill='rgb(243, 245, 247)'
      height='20'
      role='img'
      viewBox='0 0 24 24'
      width='20'
      cursor={"pointer"}
    >
      <title>Share</title>
      <line
        fill='none'
        stroke='currentColor'
        strokeLinejoin='round'
        strokeWidth='2'
        x1='22'
        x2='9.218'
        y1='3'
        y2='10.083'
      ></line>
      <polygon
        fill='none'
        points='11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334'
        stroke='currentColor'
        strokeLinejoin='round'
        strokeWidth='2'
      ></polygon>
    </svg>
  )
}