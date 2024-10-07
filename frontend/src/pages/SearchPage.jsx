import { Box, Divider, Flex, Input, Skeleton, SkeletonCircle, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import SuggestedUsers from '../components/SuggestedUsers'
import { IoSearch } from 'react-icons/io5'
import useDebounce from '../hooks/useDebounce'
import useShowToast from '../hooks/useShowToast'
import SuggestedUser from '../components/SuggestedUser'

const SearchPage = () => {

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 1500)
  const showToast = useShowToast()


  const searchUsers = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/users/search?username=${encodeURIComponent(debouncedSearchTerm)}`, {
        method: "GET",
      });
      const data = await res.json()
      if (data.error) {
        showToast("Error", data.error, "error")
        return
      }
      setResults(data)
    } catch (error) {
      showToast("Error", error.message, "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchUsers(debouncedSearchTerm);
    } else {
      setResults([]);
      setIsLoading(false)
    }
  }, [debouncedSearchTerm]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value) {
      setResults([]);
      setIsLoading(false)
    }
  }

  return (
    <>
      <Text fontWeight={"bold"} fontSize={{ base: "md", md: "xl" }} textAlign={"center"} w={"full"} pt={2} mb={4} >
        Search
      </Text>
      <Flex justifyContent={"center"} gap={1} alignItems={"center"} border={"1px"} borderColor={"gray.light"} p={{ base: 1.5, md: 2 }} borderRadius={"3xl"} w={{ base: "90%", md: "full" }} mx={"auto"}>
        <IoSearch size={35} color='gray' />
        <Input
          value={searchTerm} onChange={handleSearch} placeholder='Search' border={"none"} _focus={{ border: "none" }} focusBorderColor='none' />
      </Flex>
      <Divider my={1} />
      {!searchTerm && (
        <Box mt={5} p={{ base: 2, md: 0 }}>
          <SuggestedUsers isDivider={true} />
        </Box>
      )}

      {results?.map((user) => (
        <Box mt={3} p={{ base: 2, md: 0 }}>
          <SuggestedUser key={user._id} user={user} isDivider={true} />
        </Box>
      ))}
      {isLoading &&
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
    </>
  )
}

export default SearchPage