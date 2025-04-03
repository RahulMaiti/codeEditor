// types/chat.ts

export type ChatMessage = {
    id: string;
    username: string;
    message?: string; // Make message optional
    timestamp: string;
    audio?: Blob; // Add audio property
    type: "text" | "audio"; // added type here.
};

export type ChatContext = {
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    isNewMessage: boolean;
    setIsNewMessage: React.Dispatch<React.SetStateAction<boolean>>;
    lastScrollHeight: number;
    setLastScrollHeight: React.Dispatch<React.SetStateAction<number>>;
};