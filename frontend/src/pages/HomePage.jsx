import { Box, Button, Flex, Spinner } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import useShowToast from '../hooks/useShowToast'
import Post from '../components/Post'
import { useRecoilState } from 'recoil'
import postsAtom from '../atoms/postAtom'
import SuggestedUsers from '../components/SuggestedUsers'

const HomePage = () => {
  const showToast = useShowToast()
  const [posts, setPosts] = useRecoilState(postsAtom)
  const [loading, setLoading] = useState(true)


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
      <Box flex={70}>
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