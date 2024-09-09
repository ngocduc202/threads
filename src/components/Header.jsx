import { Flex, Image, useColorMode } from '@chakra-ui/react'
import React from 'react'

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <Flex justifyContent={"center"} mt={6} mb={12}>
      <Image
        src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
        alt="logo"
        w={6}
        cursor={"pointer"}
        onClick={toggleColorMode}
      />
    </Flex>
  )
}

export default Header