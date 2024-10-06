import React, { useEffect, useState } from 'react'
import { Avatar, Box, Button, Flex, Menu, Link, MenuButton, MenuItem, MenuList, Portal, Text, useToast, VStack, useDisclosure, Modal, ModalOverlay, ModalContent, ModalBody, Tabs, TabList, Tab, TabPanels, TabPanel, ModalFooter, SkeletonCircle, Skeleton, useColorModeValue, Divider, ModalCloseButton } from '@chakra-ui/react'
import { BsInstagram } from 'react-icons/bs'
import { CgMoreO } from 'react-icons/cg'
import { useRecoilValue } from 'recoil'
import userAtom from '../atoms/userAtom'
import { Link as RouterLink } from "react-router-dom"
import useFollowUnfollow from '../hooks/useFollowUnfollow.js'
import SuggestedUser from './SuggestedUser.jsx'

const UserHeader = ({ user }) => {

  const toast = useToast()
  const currentUser = useRecoilValue(userAtom)
  const { following, handleFollowUnfollow, updating } = useFollowUnfollow(user)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const copyUrl = () => {
    const currentUrl = window.location.href
    navigator.clipboard.writeText(currentUrl).then(() => {
      toast({
        description: "Profile URL copied to clipboard",
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    })
  }

  useEffect(() => {
    if (isOpen && user) {
      fetchDetails();
    }
  }, [isOpen, user, activeTab]);


  const fetchDetails = async () => {
    setLoading(true);
    try {
      const ids = activeTab === 0 ? user?.followers : user?.following;
      const res = await fetch("/api/users/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });

      const data = await res.json();
      setDetails(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <VStack gap={4} align={"start"} pt={5}>
        <Flex justifyContent={"space-between"} w={"full"}>
          <Box>
            <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight={"bold"}>{user?.name}</Text>
            <Flex gap={2} alignItems={"center"}>
              <Text fontSize={{ base: "sm", md: "md" }}>{user?.username}</Text>
              <Text fontSize={"sm"} bg={"gray.dark"} color={"gray.light"} p={1} borderRadius={"full"} >threads.net</Text>
            </Flex>
          </Box>
          <Box>
            {user?.profilePic && (
              <Avatar
                name={user?.name}
                src={user?.profilePic}
                size={{
                  base: "lg",
                  md: "xl",
                }}
              />
            )}
            {!user?.profilePic && (
              <Avatar
                name={user?.name}
                src='https://bit.ly/broken-link'
                size={{
                  base: "md",
                  md: "xl",
                }}
              />
            )}
          </Box>
        </Flex>
        <Text>
          {user?.bio}
        </Text>
        {currentUser?._id === user?._id && (
          <Link as={RouterLink} to='/update' w={"full"}>
            <Button size={"sm"} w={"full"} colorScheme={"dark"} border={"1px"} borderColor={"gray.light"} _hover={{ opacity: ".8" }} py={4}>
              <Text fontSize={"sm"} color={"white"} fontWeight={"bold"}>
                Edit Profile
              </Text>
            </Button>
          </Link>
        )}
        {currentUser?._id !== user?._id && (
          <Button size={"sm"} onClick={handleFollowUnfollow} isLoading={updating}>{following ? "Unfollow" : "Follow"}</Button>
        )}
        <Flex w={"full"} justifyContent={"space-between"}>
          <Flex gap={2} alignItems={"center"} onClick={onOpen} cursor="pointer">
            <Text fontSize={"md"} color={"gray.light"}>{user?.followers?.length} followers</Text>
            <Box w='1' h='1' bg={"gray.light"} borderRadius={"full"}></Box>
            <Link color={"gray.light"}>Instagram</Link>
          </Flex>
          <Flex>
            <Box className='icon-container'>
              <BsInstagram size={24} cursor={"pointer"} />
            </Box>
            <Box className='icon-container'>
              <Menu>
                <MenuButton>
                  <CgMoreO size={24} cursor={"pointer"} />
                </MenuButton>
                <Portal>
                  <MenuList bg={"gray.dark"}>
                    <MenuItem bg={"gray.dark"} onClick={copyUrl}>Copy Link</MenuItem>
                  </MenuList>
                </Portal>
              </Menu>
            </Box>
          </Flex>
        </Flex>
        <Flex w={"full"}>
          <Flex flex={1} borderBottom={"1.5px solid white"} justifyContent={"center"} pb={3} cursor={"pointer"} >
            <Text fontWeight={"bold"}>Threads</Text>
          </Flex>
          <Flex flex={1} borderBottom={"1px solid gray"} justifyContent={"center"} color={"gray.light"} pb={3} cursor={"pointer"} >
            <Text fontWeight={"bold"}>Replies</Text>
          </Flex>
        </Flex>
      </VStack >

      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius={{ base: "none", md: "2xl" }} border={{ base: "none", md: "1px" }} borderColor={{ base: "none", md: "gray.600" }} bg={useColorModeValue("gray.200", "gray.dark")} >
          <ModalCloseButton textAlign={"right"} zIndex={5} display={{ base: "block", md: "none" }} />
          <ModalBody>
            {loading ? (
              [0, 1, 2, 3, 4].map((_, idx) => (
                <Flex key={idx} gap={2} alignItems={"center"} p={"1"} borderRadius={"md"} mt={2}>
                  <Box>
                    <SkeletonCircle size={"10"} />
                  </Box>
                  <Flex w={"full"} flexDirection={"column"} gap={2}>
                    <Skeleton h={"8px"} w={"80px"} />
                    <Skeleton h={"8px"} w={"90px"} />
                  </Flex>
                  <Flex>
                    <Skeleton h={"20px"} w={"60px"} />
                  </Flex>
                </Flex>
              ))
            ) : (
              <VStack spacing={4} w={"full"} h={"screen"}>
                <Tabs index={activeTab} onChange={(index) => setActiveTab(index)} w={"full"}>
                  <TabList>
                    <Tab display={"flex"} alignItems={"center"} flexDirection={"column"}>
                      <Text>Followers</Text>
                      <Text color={activeTab === 0 ? "blue.500" : "gray.500"} fontSize={"sm"}>{user?.followers?.length}</Text>
                    </Tab>
                    <Tab display={"flex"} alignItems={"center"} flexDirection={"column"}>
                      <Text>Following</Text>
                      <Text color={activeTab === 1 ? "blue.500" : "gray.500"} fontSize={"sm"}>{user?.following?.length}</Text>
                    </Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel onClick={onClose}>
                      {details?.length > 0 ? (
                        details?.map((follower) => (
                          <>
                            <SuggestedUser key={follower._id} user={follower} />
                            <Divider my={1} />
                          </>
                        ))
                      ) : (
                        <Text>No followers to display.</Text>
                      )}
                    </TabPanel>
                    <TabPanel>
                      {details?.length > 0 ? (
                        details?.map((following) => (
                          <>
                            <SuggestedUser key={following._id} user={following} />
                            <Divider my={1} />
                          </>
                        ))
                      ) : (
                        <Text>No following to display.</Text>
                      )}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UserHeader