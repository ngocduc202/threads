
import { Box, Container, useMediaQuery } from "@chakra-ui/react"
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
import NotificationPage from "./pages/NotificationPage"
import SearchPage from "./pages/SearchPage"
import useNotification from "./hooks/useNotification"
import { useEffect } from "react"
import useShowToast from "./hooks/useShowToast"


function App() {
  const user = useRecoilValue(userAtom)
  const { pathname } = useLocation()
  const { notifications } = useNotification(user?._id)
  const showToast = useShowToast()
  const [isMobile] = useMediaQuery("(max-width: 768px)")
  useEffect(() => {
    if (notifications.length > 0) {
      showToast("Notification", "You have new notifications", "info")
    }
  }, [notifications, showToast]);

  return (
    <Box position={"relative"} w={'full'} >
      <Container maxW={pathname === "/" ? { base: "650px", md: "900px" } : "650px"} p={0}  >
      //Fix for mobile
        {!(pathname === "/chat" && isMobile) && <Header />}
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
              <Navigate to={"/auth"} />
            )} />
          <Route path="/:username/post/:pid" element={<PostPage />} />
          <Route path="/chat" element={user ? <ChatPage /> : <Navigate to={"/auth"} />} />
          <Route path="/search" element={user ? <SearchPage /> : <Navigate to={"/auth"} />} />
          <Route path="/notifications" element={user ? <NotificationPage /> : <Navigate to={"/auth"} />} />
          <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to={"/auth"} />} />
        </Routes>
        <Box w={"full"} h={"50px"} />
      </Container>
    </Box>
  )
}

export default App
