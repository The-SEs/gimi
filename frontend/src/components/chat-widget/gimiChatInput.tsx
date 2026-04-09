import { useState } from "react"

export default function GimiChatInput({
  onSend,
}: {
  onSend: (msg: string) => void
}) {
  const [text, setText] = useState("")

  // Check if input is empty, ignoring whitespace
  const isInputEmpty = text.trim() === ""

  const handleSend = () => {
    // Protection: don't send if empty
    if (isInputEmpty) return

    onSend(text)
    setText("") // Clear the input field after sending
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex h-10 w-full" />
      <div className="flex items-center gap-3">
        {/* LIGHT BLUE INPUT BOX with Placeholder */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // Send on Enter, but only if the input isn't empty
            if (e.key === "Enter" && !isInputEmpty) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-gray-200 px-5 py-3 outline-none focus:border-[#f3a9b7]"
        />

        {/* CIRCULAR SEND BUTTON with mauve arrow */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isInputEmpty}
          className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-all duration-200 hover:scale-[1.03] ${
            isInputEmpty
              ? "cursor-not-allowed bg-gray-300 opacity-60"
              : "bg-[#844250] hover:bg-[#6b3541]"
          }`}
          aria-label="Send message"
        >
          {/* Mauve arrow icon */}
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
