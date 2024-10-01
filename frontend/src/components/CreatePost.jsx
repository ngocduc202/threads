import { AddIcon } from '@chakra-ui/icons'
import { Avatar, Box, Button, CloseButton, Divider, Flex, FormControl, Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Textarea, useColorModeValue, useDisclosure } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import usePreviewImg from '../hooks/usePreviewImg'
import { BsFillImageFill } from 'react-icons/bs'
import { useRecoilState, useRecoilValue } from 'recoil'
import userAtom from '../atoms/userAtom'
import useShowToast from '../hooks/useShowToast'
import postsAtom from '../atoms/postAtom'
import { useParams } from 'react-router-dom'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'


const MAX_CHAR = 500

const CreatePost = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [postText, setPostText] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR)
  const [loading, setLoading] = useState(false)
  const imageRef = useRef(null)
  const user = useRecoilValue(userAtom)
  const showToast = useShowToast()
  const [posts, setPosts] = useRecoilState(postsAtom)
  const { username } = useParams()


  const handleTextChange = (e) => {
    const inputText = e.target.value
    if (inputText.length > MAX_CHAR) {
      const truncatedText = inputText.slice(0, MAX_CHAR)
      setPostText(truncatedText)
      setRemainingChar(0)
    } else {
      setPostText(inputText)
      setRemainingChar(MAX_CHAR - inputText.length)
    }
  }

  const handleCreatePost = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postedBy: user._id, text: postText, img: imgUrl }),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post created successfully", "success");
      if (username === user.username) {
        setPosts([data, ...posts]);
      }
      onClose();
      setPostText("");
      setImgUrl("");
      setShowEmojiPicker(false);
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setPostText(prev => prev + emoji.native);
  }

  return (
    <>
      <Button
        bg={useColorModeValue("gray.200", "gray.dark")}
        onClick={onOpen}
        size={{ base: "sm", sm: "md" }}
      >
        <AddIcon />
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent borderRadius={{ base: "none", md: "2xl" }} border={{ base: "none", md: "1px" }} borderColor={{ base: "none", md: "gray.600" }} bg={useColorModeValue("gray.200", "gray.dark")} w={"full"}>
          <ModalHeader textAlign={"center"} p={3} >
            <ModalCloseButton alignItems={"center"} mt={1} size={"md"} />
            New thread
          </ModalHeader>
          <Divider my={1} />
          <ModalBody pb={6}>
            <Flex >
              <Avatar src={user?.profilePic} name={user?.name} w={"10"} h={"10"} />
              <FormControl>
                <Text ml={4} fontSize={"sm"} color={"light.800"}>
                  <b>{user?.username}</b>
                </Text>
                <Textarea
                  placeholder='Post content here..'
                  onChange={handleTextChange}
                  value={postText}
                  border={"none"}
                  _focusVisible={{ outline: "none" }}
                  rows={1}
                />
                <Text
                  fontSize={"xs"}
                  fontWeight={"bold"}
                  textAlign={"right"}
                  margin={"1"}
                  color={"light.800"}
                >
                  {remainingChar}/{MAX_CHAR}
                </Text>
                <Input
                  type='file'
                  hidden
                  ref={imageRef}
                  onChange={handleImageChange}
                />

                <Flex alignItems={"center"}>
                  <BsFillImageFill
                    style={{ marginLeft: "17px", cursor: "pointer" }}
                    size={16}
                    onClick={() => imageRef.current.click()}
                  />

                  <Button size={"lg"} onClick={() => setShowEmojiPicker((prev) => !prev)} bg={"none"} _hover={"none"} display={{ base: "none", md: "block" }} >
                    😊
                  </Button>
                </Flex>
              </FormControl>
            </Flex>

            {showEmojiPicker && (
              <Box w={"200px"} h={"200px"} position={"absolute"} bottom={"-63px"} right={"90px"} zIndex={10}>
                <Picker data={data} onEmojiSelect={handleEmojiSelect} />
              </Box>
            )}

            {imgUrl && (
              <Flex mt={5} w={"full"} position={"relative"}>
                <Image src={imgUrl} alt='post' />
                <CloseButton
                  onClick={() => setImgUrl('')}
                  bg={"gray.800"}
                  position={"absolute"}
                  top={2}
                  right={2}
                />
              </Flex>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='black' mr={3} onClick={handleCreatePost} isLoading={loading} _hover={{ opacity: ".8" }} border={"1px solid gray"} borderRadius={"lg"}>
              <Text fontWeight={"bold"} color={"white"} px={2} py={2}>
                Post
              </Text>
            </Button>
          </ModalFooter>
        </ModalContent >
      </Modal >
    </>
  )
}

export default CreatePost