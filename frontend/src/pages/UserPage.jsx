import React, { useEffect, useState } from 'react'
import UserHeader from '../components/UserHeader'
import UserPost from '../components/UserPost'
import { useParams } from 'react-router-dom'
import useShowToast from '../hooks/useShowToast'


const UserPage = () => {
  const [user, setUser] = useState(null)
  const { username } = useParams()
  const showToast = useShowToast()

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`)
        const data = await res.json()
        if (data.error) {
          showToast("Error", data.error, "error")
          return
        }
        setUser(data.user)
      } catch (error) {
        showToast("Error", data.error, "error")
      }
    }

    getUser()
  }, [username, showToast])

  if (!user) return null
  return (
    <>
      <UserHeader user={user} />
      <UserPost likes={1200} replies={412} postImg="/post1.png" postTitle="Mark Zuckerberg" />
      <UserPost likes={1220} replies={415} postImg="/post2.png" postTitle="New York" />
      <UserPost likes={900} replies={312} postImg="/post3.png" postTitle="Leslie Knope" />
    </>
  )
}

export default UserPage