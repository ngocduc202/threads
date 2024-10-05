import { Avatar, Box, Button, Divider, Flex, Spinner, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import useShowToast from '../hooks/useShowToast'
import Post from '../components/Post'
import { useRecoilState, useRecoilValue } from 'recoil'
import postsAtom from '../atoms/postAtom'
import SuggestedUsers from '../components/SuggestedUsers'
import userAtom from '../atoms/userAtom'
import CreatePost from '../components/CreatePost'

const HomePage = () => {
  const showToast = useShowToast()
  const [posts, setPosts] = useRecoilState(postsAtom)
  const [loading, setLoading] = useState(true)
  const user = useRecoilValue(userAtom)

  useEffect(() => {
    const getFeedPosts = async () => {
      setLoading(true)
      setPosts([])
      try {
        const res = await fetch('/api/posts/feed')
        const data = await res.json()

        if (data.error) {
          showToast("Error", data.error, "error")
          return
        }
        setPosts(data)
      } catch (error) {
        showToast("Error", error.message, "error")
      } finally {
        setLoading(false)
      }
    }

    getFeedPosts()
  }, [showToast, setPosts])


  return (
    <Flex gap="10" alignItems="flex-start" p={6}>
      <Box flex={70} p={{ base: 0, md: 6 }} bg={{ base: "none", md: "dark" }} >
        <Flex gap={3} alignItems={"center"} justifyItems={"center"} my={2} justifyContent={"space-between"}>
          <Flex gap={3} alignItems={"center"} justifyItems={"center"}>
            <Avatar src={user?.profilePic} size={"md"} />
            <Text textColor={"gray.300"}>What's new ?</Text>
          </Flex>
          <CreatePost post={true} />
        </Flex>

        <Divider mt={5} w={"full"} />

        {!loading && posts.length === 0 && (
          <h1>Follow some users to see their posts</h1>
        )}
        {loading && (
          <Flex justify={"center"}>
            <Spinner
              size="xl"
            />
          </Flex>
        )}

        {posts?.map((post) => (
          <Post key={post._id} post={post} postedBy={post.postedBy} />
        )
        )}
      </Box>

      <Box flex={30}
        display={{
          base: "none",
          md: "block",
        }}
      >
        <SuggestedUsers />
      </Box>
    </Flex>
  )
}

export default HomePage