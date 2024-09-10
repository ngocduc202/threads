import React from 'react'
import UserHeader from '../components/UserHeader'
import UserPost from '../components/UserPost'


const UserPage = () => {

  return (
    <>
      <UserHeader />
      <UserPost likes={1200} replies={412} postImg="/post1.png" postTitle="Mark Zuckerberg" />
      <UserPost likes={1220} replies={415} postImg="/post2.png" postTitle="New York" />
      <UserPost likes={900} replies={312} postImg="/post3.png" postTitle="Leslie Knope" />
    </>
  )
}

export default UserPage