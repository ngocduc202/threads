import { Avatar, Box, Button, Divider, Flex, Image, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { BsThreeDots } from 'react-icons/bs'
import Actions from '../components/Actions'
import Comment from '../components/Comment'

const PostPage = () => {
  const [liked, setLiked] = useState(false)
  return (
    <>
      <Flex>
        <Flex w={"full"} alignItems={"center"} gap={3}>
          <Avatar src='/zuck-avatar.png' size={"md"} name='Mark' />
          <Flex>
            <Text fontSize={"sm"} fontWeight={"bold"}>Mark Zuckerberg</Text>
            <Image src='/verified.png' w={4} h={4} ml={4} />
          </Flex>
        </Flex>
        <Flex gap={4} alignItems={"center"}>
          <Text fontSize={"sm"} color={"gray.light"}>1d</Text>
          <BsThreeDots />
        </Flex>
      </Flex>

      <Text my={3}>Let talk about something</Text>
      <Box
        borderRadius={6}
        overflow={"hidden"}
        border={"1px solid gray.light"}
      >
        <Image src={"/post1.png"} alt="post-image" w={"full"} />
      </Box>

      <Flex gap={3} my={3}>
        <Actions liked={liked} setLiked={setLiked} />
      </Flex>

      <Flex gap={2} alignItems={"center"}>
        <Text color={"gray.light"} fontSize={"sm"}>234 replies</Text>
        <Box w={0.5} h={0.5} bg={"gray.light"} borderRadius={"full"}></Box>
        <Text color={"gray.light"} fontSize={"sm"}>
          {200 + (liked ? 1 : 0)} likes
        </Text>
      </Flex>
      <Divider my={4} />

      <Flex justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text fontSize={"2xl"}>👋</Text>
          <Text color={"gray.light"}>Get the app to like, reply and post.</Text>
        </Flex>
        <Button>
          Get
        </Button>
      </Flex>

      <Divider my={4} />

      <Comment comment="look good" createdAt="2d" likes={100} username="Mark Zuckerberg" userAvatar="https://bit.ly/prosper-baba" />
      <Comment comment="wow" createdAt="1d" likes={42} username="Mark Zuckerberg" userAvatar="https://bit.ly/code-beast" />
      <Comment comment="Amazing" createdAt="2d" likes={12} username="Mark Zuckerberg" userAvatar="https://bit.ly/sage-adebayo" />
    </>
  )
}
//1:30
export default PostPage