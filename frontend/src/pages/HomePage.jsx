import { Button, Flex } from '@chakra-ui/react'
import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <Link to={"/markzurckerberg"}>
      <Flex>
        <Button>Visit Profile</Button>
      </Flex>
    </Link>
  )
}

export default HomePage