import { useState, useEffect, useRef } from "react"
import { XMarkIcon, ArrowLeftIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "react-router-dom"
import { api } from "../../services/api.ts"

import GimiChatInput from "./gimiChatInput.tsx"
import GimiUserChatBubble from "./gimiUserChatBubble.tsx"
import GimiChatBubble from "./gimiChatBubble.tsx"

// Adjust these imports depending on your exact folder structure
import GimiAlert from "../alert/gimiAlert"
import Consulation from "../header/consultation"

type GimiChatWindowProps = {
  className?: string
  onClose?: () => void
}

type Message = {
  sender: "user" | "gimi"
  text: string
}

export default function GimiChatWindow({
  className = "",
  onClose,
}: GimiChatWindowProps) {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    api
      .get("/api/wellness/chat-history/")
      .then((res) => {
        setMessages(res.data) // Loads the database messages instantly
      })
      .catch((err) => console.error("Failed to load chat history:", err))

    const socket = new WebSocket("ws://localhost:8000/ws/chat/")
    socketRef.current = socket

    socket.onmessage = (event) => {
      let chunk = ""

      try {
        const data = JSON.parse(event.data)
        chunk = data.message || data.response || data.text || ""

        // THE SOS CHECK: Trigger the alert and grab the message
        if (data.status === "high_risk") {
          setAlertMessage(
            data.message ||
              "We noticed you might be going through a tough time. Would you like to schedule a talk with the school counselor?",
          )
          setShowAlert(true)
        }
      } catch (e) {
        chunk = event.data
      }

      if (!chunk) return

      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1]

        if (lastMessage && lastMessage.sender === "gimi") {
          const updatedMessages = [...prev]
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            text: lastMessage.text + chunk,
          }
          return updatedMessages
        }

        return [...prev, { sender: "gimi", text: chunk }]
      })
    }

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error)
    }

    return () => {
      socket.close()
    }
  }, [])

  const handleSend = (message: string) => {
    setMessages((currentMessages) => [
      ...currentMessages,
      { sender: "user", text: message },
    ])

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message }))
    } else {
      console.error("WebSocket is not connected.")
    }
  }

  return (
    <section
      className={`relative flex h-[760px] w-full max-w-md flex-col overflow-hidden rounded-[32px] bg-[#fdfefe]/92 shadow-[0_30px_70px_rgba(111,162,229,0.3)] ring-1 ring-white/65 backdrop-blur-sm md:max-w-2xl lg:max-w-4xl ${className}`.trim()}
    >
      {/* THE GIMI ALERT MODAL */}
      {showAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-sky-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in zoom-in-95 fade-in duration-200">
            <GimiAlert
              title="GIMI Notice"
              message={alertMessage}
              onClose={() => setShowAlert(false)}
              actionNode={<Consulation />}
            />
          </div>
        </div>
      )}

      {/* DISTINCT PINK HEADER BAR with DECORATIVE DOTS */}
      <div className="h-10 bg-linear-to-r from-[#f7b2cc] via-[#f9bed2] to-[#f4b5d0]" />

      {/* HEADER CONTROLS below pink bar */}
      <div className="flex items-center justify-between px-6 pb-3 pt-4 sm:px-9">
        {/* Left side with BACK button and decorative dots */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-[#844250] shadow-sm transition hover:scale-105 hover:bg-white"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-5 w-5 stroke-2" />
          </button>

          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-[#cfd3ee]" />
            <span className="h-3.5 w-3.5 rounded-full bg-[#cfd3ee]" />
          </div>
        </div>

        {/* Right side with CLOSE button styled as X in circle */}
        <button
          type="button"
          onClick={onClose}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[#f3a9b7] bg-[#ffd5de] text-[#844250] shadow-[0_10px_20px_rgba(246,160,177,0.32)] transition hover:scale-[1.03]"
          aria-label="Close chat window"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* MESSAGE LIST BODY */}
      <div className="flex min-h-0 flex-1 flex-col px-6 sm:px-9">
        <div className="gimi-jelly-scrollbar mt-2 min-h-0 flex-1 overflow-y-auto rounded-[26px] pr-1">
          <div className="space-y-4 px-1 pb-6">
            {messages.map((msg, index) =>
              msg.sender === "user" ? (
                <GimiUserChatBubble key={`${index}-user`} message={msg.text} />
              ) : (
                <GimiChatBubble key={`${index}-gimi`} message={msg.text} />
              ),
            )}
          </div>
        </div>

        {/* CONTAIN-STYLED INPUT BOX AT BOTTOM */}
        <div className="pb-7 pt-5 sm:pb-8">
          <GimiChatInput onSend={handleSend} />
        </div>
      </div>
    </section>
  )
}
