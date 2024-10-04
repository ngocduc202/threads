import { Button, Flex, Image, Link, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Text, useBreakpointValue, useColorMode, useDisclosure } from '@chakra-ui/react'
import React from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import userAtom from '../atoms/userAtom'
import { AiFillHome } from 'react-icons/ai'
import { RxAvatar } from 'react-icons/rx'
import { BsFillChatQuoteFill } from 'react-icons/bs'
import { Link as RouterLink } from "react-router-dom"
import { FiLogOut } from 'react-icons/fi'
import { IoSearch } from "react-icons/io5";
import { MdOutlineNoAccounts } from "react-icons/md";
import { CiHeart } from "react-icons/ci";
import useLogout from '../hooks/useLogout'
import authScreenAtom from '../atoms/authAtom'
import { MdOutlineSettings } from 'react-icons/md'
import CreatePost from './CreatePost'

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const user = useRecoilValue(userAtom)
  const logout = useLogout()
  const setAuthScreen = useSetRecoilState(authScreenAtom)

  const flexDirection = useBreakpointValue({ base: 'row', md: 'column' })
  const position = useBreakpointValue({ base: 'fixed', md: 'fixed' })
  const justifyContent = useBreakpointValue({ base: 'center', md: 'space-between' })
  const bottomOrLeft = useBreakpointValue({ base: 'bottom', md: 'left' })
  const popoverPlacement = useBreakpointValue({ base: 'top', md: 'right' })

  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      {user && (
        <Flex
          justifyContent={justifyContent}
          justifyItems={"center"}
          alignItems={"center"}
          flexDirection={flexDirection}
          position={position}
          bottom={bottomOrLeft === 'bottom' ? 0 : 'auto'}
          left={bottomOrLeft === 'left' ? 0 : 'auto'}
          p={4}
          gap={5}
          height={{ base: 'auto', md: '100vh' }}
          width={{ base: '100vw', md: 'auto' }}
          bg={colorMode === 'dark' ? 'black' : 'white'}
          borderTop={{ base: colorMode === 'dark' ? '1px solid white' : '1px solid black', md: 'none' }}
          zIndex={50}
          boxShadow={"lg"}
        >

          <Image
            src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
            alt="logo"
            w={8}
            cursor={"pointer"}
            onClick={toggleColorMode}
            display={{ base: 'none', md: 'block' }}
          />


          {user && (
            <Flex justifyItems={"center"} alignItems={"center"} flexDirection={flexDirection} gap={{ base: 5, md: 8 }}>
              <Link as={RouterLink} to={"/"}>
                <AiFillHome size={30} />
              </Link>
              <Link as={RouterLink} to={`/${user.username}`}>
                <IoSearch size={30} />
              </Link>
              <Link as={RouterLink} to={`/${user.username}`}>
                <CiHeart size={30} />
              </Link>
              <CreatePost />
              <Link as={RouterLink} to={`/${user.username}`}>
                <RxAvatar size={30} />
              </Link>
              <Link as={RouterLink} to={`/chat`}>
                <BsFillChatQuoteFill size={28} />
              </Link>
            </Flex>
          )}

          {user && (
            <Flex flexDirection={flexDirection} justifyContent={justifyContent} gap={4} >
              <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} placement={popoverPlacement} >
                <PopoverTrigger>
                  <Button>
                    <MdOutlineSettings size={25} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent bg={colorMode === 'dark' ? 'black' : 'white'}>
                  <PopoverArrow bg={colorMode === 'dark' ? 'black' : 'white'} />
                  <PopoverHeader>Setting</PopoverHeader>
                  <PopoverBody>
                    <Button size={"xs"} w={"100%"} h={"40px"} mb={2} onClick={onClose}>
                      <Link as={RouterLink} to={`/settings`} textDecoration={"none"}>
                        <Flex gap={2} align={"center"}>
                          <MdOutlineNoAccounts size={20} />
                          <Text fontWeight={"bold"} fontSize={"sm"}>
                            Freeze account
                          </Text>
                        </Flex>
                      </Link>
                    </Button>
                    <Button size={"xs"} onClick={logout} w={"100%"} h={"40px"}>
                      <Flex gap={2} align={"center"}>
                        <FiLogOut size={20} />
                        <Text fontWeight={"bold"} fontSize={"sm"}>
                          Logout
                        </Text>
                      </Flex>
                    </Button>
                  </PopoverBody>
                </PopoverContent>
              </Popover>

            </Flex>
          )}
        </Flex>
      )}
    </>


  )
}

export default Header