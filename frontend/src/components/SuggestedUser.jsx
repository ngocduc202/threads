import { Avatar, Box, Button, Divider, Flex, Text } from '@chakra-ui/react'
import React from 'react'
import { Link } from 'react-router-dom'
import useFollowUnfollow from '../hooks/useFollowUnfollow'

const SuggestedUser = ({ user, isDivider }) => {

  const { following, handleFollowUnfollow, updating } = useFollowUnfollow(user)
  return (
    <>
      <Flex gap={3} justifyContent={"space-between"} alignItems={"center"}>
        <Flex gap={3} as={Link} to={`/${user?.username}`}>
          <Avatar src={user?.profilePic} />
          <Box>
            <Text fontSize={"sm"} fontWeight={"bold"}>
              {user?.username}
            </Text>
            <Text color={"gray.light"} fontSize={"sm"}>
              {user?.name}
            </Text>
          </Box>
        </Flex>
        <Button
          size={"sm"}
          colorScheme={following ? "black" : "gray"}
          bg={following ? "white" : "gray.dark"}
          onClick={handleFollowUnfollow}
          border={"1px solid gray"}
          isLoading={updating}
          _hover={{
            color: following ? "black" : "white",
            opacity: ".8",
          }}
        >
          {following ? "Unfollow" : "Follow"}
        </Button>
      </Flex>
      {isDivider ? <Divider /> : null}
    </>
  )
}

export default SuggestedUser