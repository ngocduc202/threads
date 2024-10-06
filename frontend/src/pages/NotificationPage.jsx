import { Avatar, Box, Divider, Flex, Skeleton, SkeletonCircle, Text, useColorModeValue } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useShowToast from '../hooks/useShowToast'
import { FaUser, FaHeart } from 'react-icons/fa'
import { formatDistanceToNow } from 'date-fns'
import { useRecoilValue } from 'recoil'
import userAtom from '../atoms/userAtom'
import { DeleteIcon } from '@chakra-ui/icons'


const NotificationPage = () => {

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const showToast = useShowToast()
  const currentUser = useRecoilValue(userAtom)

  useEffect(() => {
    const getNotifications = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/notifications")
        const data = await res.json()
        if (data.error) {
          showToast("Error", data.error, "error")
          return
        }
        setNotifications(data)
      } catch (error) {
        showToast("Error", error.message, "error")
      } finally {
        setLoading(false)
      }
    }

    getNotifications()
  }, [showToast])

  const deleteNotification = async (notificationId) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.error) {
        showToast("Error", data.error, "error")
        return
      }
      showToast("Success", "Notification deleted successfully", "success")
      setNotifications(notifications.filter((notification) => notification._id !== notificationId))
    } catch (error) {
      showToast("Error", error.message, "error")
    }
  }

  return (
    <>
      <Text fontWeight={"bold"} fontSize={{ base: "md", md: "xl" }} textAlign={"center"} w={"full"} pt={2} mb={4} >
        Notification
      </Text>
      <Divider my={1} />
      {loading &&
        [0, 1, 2, 3, 4].map((_, idx) => (
          <Flex key={idx} gap={2} alignItems={"center"} p={"1"} borderRadius={"md"}>
            <Box>
              <SkeletonCircle size={"10"} />
            </Box>
            <Flex w={"full"} flexDirection={"column"} gap={2}>
              <Skeleton h={"8px"} w={"80px"} />
              <Skeleton h={"8px"} w={"90px"} />
            </Flex>
          </Flex>
        ))}
      {!loading && notifications?.length === 0 && (
        <Box
          mt={5}
          textAlign={"center"}
        >
          <Text
            fontSize={"md"}
            fontWeight={"bold"}>
            No notifications 🤔
          </Text>
        </Box>
      )}
      {!loading && (
        <Box
        >
          {notifications?.map((notification) => (
            <>
              <Flex gap={3} textAlign={"left"} key={notification?._id} ml={3} mt={5} justify={"space-between"}>
                <Flex gap={2} alignItems={"center"}>
                  <Avatar src={notification?.from?.profilePic} size={"md"} name={notification?.from?.username} />
                  <Box>
                    <Link to={`/${notification?.from?.username}`}>
                      <Flex textAlign={"left"} alignItems={"center"} gap={3}>
                        <Text fontWeight={"bold"}>{notification?.from?.username}</Text>
                        <Text fontSize={"xs"} w={36} color={"gray.light"}>{formatDistanceToNow(new Date(notification?.createdAt))} ago</Text>
                      </Flex>
                    </Link>
                    <Flex gap={3} alignItems={"center"} justifyItems={"center"}>
                      {notification?.type === "follow" ? (
                        <Text fontSize={"sm"} textColor={"gray.light"}>started following you</Text>
                      ) : notification?.type === "like" ? (
                        <Text fontSize={"md"} textColor={"gray.light"}>liked your post</Text>
                      ) : notification?.type === "reply" ? (
                        <Link to={`/${currentUser?.username}/post/${notification?.postId}`} style={{ width: "100%" }}>
                          <Text fontSize={"md"} textColor={"gray.light"}>replied: {notification?.text}</Text>
                        </Link>
                      ) : null}
                      {notification?.type === "like" && <FaHeart size={15} color='red' />}
                      {notification?.type === "follow" && <FaUser size={15} color='blue' />}
                    </Flex>
                  </Box>
                </Flex>
                <DeleteIcon size={20} onClick={() => deleteNotification(notification?._id)} cursor={"pointer"} mr={3} />
              </Flex>
              <Divider my={1} mt={5} />
            </>
          ))}
        </Box>
      )}
    </>
  )
}

export default NotificationPage