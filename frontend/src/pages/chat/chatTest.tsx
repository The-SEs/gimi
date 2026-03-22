import GimiChatWindow from "../../components/chat-widget/gimiChatWindow";

// PLEASE REMOVE EVENTUALLY. FOR TESTING ONLY.
export default function ChatTestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-[450px]">
        <GimiChatWindow />
      </div>
    </div>
  );
}
