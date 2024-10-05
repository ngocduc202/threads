
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
  Container,
  useBreakpointValue,
  Image,
} from '@chakra-ui/react'
import { useState } from 'react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useSetRecoilState } from 'recoil'
import authScreenAtom from '../atoms/authAtom'
import useShowToast from '../hooks/useShowToast'
import userAtom from '../atoms/userAtom'
import background from '../assets/background.png'

export default function LoginCard() {
  const [showPassword, setShowPassword] = useState(false)
  const setAuthScreen = useSetRecoilState(authScreenAtom)
  const setUser = useSetRecoilState(userAtom)
  const [loading, setLoading] = useState(false)
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
  })
  const backgroundDisplay = useBreakpointValue({ base: 'none', md: `url(${background})` });
  const showToast = useShowToast()

  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inputs)
      })

      const data = await res.json()

      if (data.error) {
        showToast("Error", data.error, "error")
        return
      }
      localStorage.setItem("user-threads", JSON.stringify(data))
      setUser(data)
    } catch (error) {
      showToast("Error", error, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      {backgroundDisplay !== 'none' && (
        <img src={background} alt="background" style={{ position: "fixed", top: 0, left: 0, zIndex: -1, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      <Flex align={'center'} justify={'center'} mt={5}>
        <Image
          src={"/light-logo.svg"}
          alt="logo"
          w={8}
          cursor={"pointer"}
          display={{ base: 'block', md: 'none' }}
        />
      </Flex>
      <Flex
        align={'center'}
        justify={'center'}
      >
        <Stack mx={'auto'} maxW={'lg'} mt={{ base: 12, md: "200px" }} px={3}>
          <Stack align={'center'}>
            <Heading fontSize={'2xl'} textAlign={'center'}>
              Login
            </Heading>
          </Stack>
          <Box
            rounded={'lg'}
            bg={useColorModeValue('white', 'transparent')}
            boxShadow={'lg'}
            p={8}
            w={{
              base: "full",
              sm: "490px"
            }}
          >
            <Stack w={"full"}>
              <FormControl isRequired>
                <Input type="text"
                  onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                  value={inputs.username}
                  background={useColorModeValue('white', 'gray.dark')}
                  placeholder='Username'
                  focusBorderColor='none'
                  h={"55px"}
                  borderRadius={"xl"}
                />
              </FormControl>
              <FormControl isRequired>
                <InputGroup>
                  <Input type={showPassword ? 'text' : 'password'}
                    onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                    value={inputs.password}
                    background={useColorModeValue('white', 'gray.dark')}
                    placeholder='Password'
                    focusBorderColor='none'
                    h={"55px"}
                    borderRadius={"xl"}
                  />
                  <InputRightElement h={'full'}>
                    <Button
                      variant={'ghost'}
                      onClick={() => setShowPassword((showPassword) => !showPassword)}>
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Stack spacing={10} pt={2}>
                <Button
                  loadingText="Logging in..."
                  size="lg"
                  bg={useColorModeValue('gray.600', 'white')}
                  color={'gray.light'}
                  _hover={{
                    bg: useColorModeValue('gray.700', 'gray.dark'),
                  }}
                  onClick={handleLogin}
                  isLoading={loading}
                  borderRadius={"xl"}
                >
                  Login
                </Button>
              </Stack>
              <Stack pt={6}>
                <Text align={'center'}>
                  Don&apos;t have an account? <Link color={'blue.400'}
                    onClick={() => setAuthScreen("signup")}
                  >Sign up</Link>
                </Text>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Flex>
    </Container>

  )
}