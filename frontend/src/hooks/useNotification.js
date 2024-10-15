// hooks/useNotification.js
import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import messageSound from "../assets/sounds/message.mp3";

const useNotification = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
        const sound = new Audio(messageSound)
        sound.play()
      console.log("Received notification:", notification);
      setNotifications((prevNotifications) => [notification, ...prevNotifications]);
    };
    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [userId, socket]);

  return { notifications };
};

export default useNotification;
