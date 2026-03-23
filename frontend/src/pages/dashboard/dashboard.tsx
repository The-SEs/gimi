import { useEffect, useState } from "react";

import GimiChatBubble from "../../components/chat-widget/gimiChatBubble.tsx";

const demoMessages = [
  "Wow, that's a lot of words, are you okay? Do you want someone to talk to?",
  "You can talk to me if you want to let that out a little.",
  "Need a breather? We can slow down together.",
  "Do you want help sorting through what you're feeling?",
];

export default function Dashboard() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMessageIndex((currentIndex) => (currentIndex + 1) % demoMessages.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="relative min-h-[620px]">
      <div className="absolute bottom-6 left-4 right-4 sm:bottom-10 sm:left-8 sm:right-8">
        <GimiChatBubble message={demoMessages[messageIndex]} />
      </div>
    </section>
  );
}


