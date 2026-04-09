import GimiChatWindow from "../../components/chat-widget/gimiChatWindow"

// PLEASE REMOVE EVENTUALLY. FOR TESTING ONLY.
export default function ChatTestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      {/* Changed this wrapper!
        Removed max-w-[450px] and added flex justify-center so it scales.
      */}
      <div className="w-full flex justify-center">
        <GimiChatWindow />
      </div>
    </div>
  )
}
