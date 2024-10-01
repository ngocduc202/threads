
import { Box, Container } from "@chakra-ui/react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import UserPage from "./pages/UserPage"
import PostPage from "./pages/PostPage"
import Header from "./components/Header"
import HomePage from "./pages/HomePage"
import AuthPage from "./pages/AuthPage"
import { useRecoilValue } from "recoil"
import userAtom from "./atoms/userAtom"
import UpdateProfilePage from "./pages/UpdateProfilePage"
import ChatPage from "./pages/ChatPage"
import SettingsPage from "./components/SettingsPage"

function App() {
  const user = useRecoilValue(userAtom)
  const { pathname } = useLocation()
  return (
    <Box position={"relative"} w={'full'}>
      <Container maxW={pathname === "/" ? { base: "650px", md: "900px" } : "650px"} p={0}>
        <Header />
        <Routes>
          <Route path="/" element={user ? <HomePage /> : <Navigate to={"/auth"} />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to={"/"} />} />
          <Route path="/update" element={user ? <UpdateProfilePage /> : <Navigate to={"/auth"} />} />
          <Route path="/:username" element={user ?
            (
              <>
                <UserPage />
              </>
            )
            :
            (
              <UserPage />
            )} />
          <Route path="/:username/post/:pid" element={<PostPage />} />
          <Route path="/chat" element={user ? <ChatPage /> : <Navigate to={"/auth"} />} />
          <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to={"/auth"} />} />
        </Routes>
        <Box w={"full"} h={"50px"} />
      </Container>
    </Box>
  )
}

export default App
