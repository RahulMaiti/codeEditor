import { useAppContext } from "@/context/AppContext";
import { useChatRoom } from "@/context/ChatContext";
import { SyntheticEvent, useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat"; // Import ChatMessage type

function ChatList() {
    const {
        messages,
        isNewMessage,
        setIsNewMessage,
        lastScrollHeight,
        setLastScrollHeight,
    } = useChatRoom();
    const { currentUser } = useAppContext();
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    const handleScroll = (e: SyntheticEvent) => {
        const container = e.target as HTMLDivElement;
        setLastScrollHeight(container.scrollTop);
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        if (!messagesContainerRef.current) return;
        messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        if (isNewMessage) {
            setIsNewMessage(false);
        }
        if (messagesContainerRef.current)
            messagesContainerRef.current.scrollTop = lastScrollHeight;
    }, [isNewMessage, setIsNewMessage, lastScrollHeight]);

    const renderMessage = (message: ChatMessage, index: number) => {
        const isCurrentUserMessage = message.username === currentUser.username;
        let audioBlob =message.audio;
        if(message.type==="audio" && message.audio && message.audio instanceof ArrayBuffer )
        {
            const uint8Array = new Uint8Array(message.audio);
            audioBlob = new Blob([uint8Array], { type: "audio/webm" });
           
        }
           

        return (
            <div
                key={index}
                className={
                    "mb-2 w-[80%] self-end break-words rounded-md bg-dark px-3 py-2" +
                    (isCurrentUserMessage ? " ml-auto " : "")
                }
            >
                <div className="flex justify-between">
                    <span className="text-xs text-primary">{message.username}</span>
                    <span className="text-xs text-white">{message.timestamp}</span>
                </div>
                {message.type === "text" && <p className="py-1">{message.message}</p>}
                
                {message.type === "audio" && message.audio && (
                 
                    // Inside your ChatList component, where you render the <audio> element:
                    <audio 
                        controls 
                        src={URL.createObjectURL(audioBlob)} 
                        preload="metadata"
                        onError={(e) => console.error("Audio playback error:", e)} 
                    />
                )}
                {message.type === "audio" && !message.audio && (
                    <p>Audio message failed to load</p>
                )}
            </div>
        );
    };

    return (
        <div
            className="flex-grow overflow-auto rounded-md bg-darkHover p-2"
            ref={messagesContainerRef}
            onScroll={handleScroll}
        >
            {messages.map(renderMessage)}
        </div>
    );
}

export default ChatList;