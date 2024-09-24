import React, { useEffect, useState } from 'react'
import UserHeader from '../components/UserHeader'
import { useParams } from 'react-router-dom'
import useShowToast from '../hooks/useShowToast'
import { Flex, Spinner } from '@chakra-ui/react'
import Post from '../components/Post'
import useGetUserProfile from '../hooks/useGetUserProfile'
import { useRecoilState } from 'recoil'
import postAtom from '../atoms/postAtom'


const UserPage = () => {
  const { user, loading } = useGetUserProfile()
  const { username } = useParams()
  const showToast = useShowToast()
  const [posts, setPosts] = useRecoilState(postAtom)
  const [fetchingPost, setFetchingPost] = useState(true)

  useEffect(() => {
    const getPosts = async () => {
      setFetchingPost(true)
      try {
        const res = await fetch(`/api/posts/user/${username}`)
        const data = await res.json()
        setPosts(data)
      } catch (error) {
        showToast("Error", error.message, "error")
        setPosts([])
      } finally {
        setFetchingPost(false)
      }
    }
    getPosts()
  }, [username, showToast, setPosts])

  if (!user && loading) {
    return (
      <Flex justify={"center"}>
        <Spinner
          size="xl"
        />
      </Flex>
    )
  }
  if (!user && !loading) return <h1>User not found</h1>
  return (
    <>
      <UserHeader user={user} />
      {!fetchingPost && posts?.length === 0 && <h1>User has no posts.</h1>}
      {fetchingPost && (
        <Flex justifyContent={"center"}>
          <Spinner
            size="xl"
          />
        </Flex>
      )}

      {posts?.map((post) => (
        <Post key={post._id} post={post} postedBy={post?.postedBy} />
      ))}
    </>
  )
}

export default UserPage