import { useAppContext } from "@/context/AppContext";
import { useChatRoom } from "@/context/ChatContext";
import { useSocket } from "@/context/SocketContext";
import { ChatMessage } from "@/types/chat";
import { SocketEvent } from "@/types/socket";
import { formatDate } from "@/utils/formateDate";
import { FormEvent, useRef, useState } from "react";
import { LuSendHorizonal, LuMic } from "react-icons/lu";
import { v4 as uuidV4 } from "uuid";

function ChatInput() {
    const { currentUser } = useAppContext();
    const { socket } = useSocket();
    const { setMessages } = useChatRoom();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
     
    const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const inputVal = inputRef.current?.value.trim();
        if (inputVal && inputVal.length > 0) {
            const message: ChatMessage = {
                id: uuidV4(),
                message: inputVal,
                username: currentUser.username,
                timestamp: formatDate(new Date().toISOString()),
                type: "text",
            };
            socket.emit(SocketEvent.SEND_MESSAGE, { message });
            setMessages((messages) => [...messages, message]);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleRecord = async () => {
       
        if (isRecording) {
            if (mediaRecorder) {
                mediaRecorder.stop();
            }
            setIsRecording(false);
            return;
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);


            recorder.ondataavailable = (event) => {
                
                if (event.data.size > 0) {
                    console.log(event.data);
                    audioChunksRef.current.push(event.data); 
                    console.log(audioChunksRef.current);

                }
            };

            recorder.onerror = (error) => {
                console.error("MediaRecorder error:", error);
            };

            recorder.onstop = () => {
                try {
                    console.log(audioChunksRef.current);
                    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                    console.log(audioBlob);
                    if (audioBlob.size === 0) {
                        console.error("Audio blob is empty.");
                        return;
                    }
                    const message: ChatMessage = {
                        id: uuidV4(),
                        username: currentUser.username,
                        timestamp: formatDate(new Date().toISOString()),
                        audio: audioBlob,
                        type: "audio",
                    };

                    socket.emit(SocketEvent.SEND_MESSAGE, { message });
                    setMessages((messages) => [...messages, message]);
                    audioChunksRef.current=[];
                } catch (blobError) {
                    console.error("Error creating audio blob:", blobError);
                }
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    return (
        <form onSubmit={handleSendMessage} className="flex justify-between rounded-md border border-primary">
            <input
                type="text"
                className="w-full flex-grow rounded-md border-none bg-dark p-2 outline-none"
                placeholder="Enter a message..."
                ref={inputRef}
            />
            <button className="flex items-center justify-center rounded-r-md bg-primary p-2 text-black" type="button" onClick={handleRecord}>
                {isRecording ? "Stop" : <LuMic size={24} />}
            </button>
            <button className="flex items-center justify-center rounded-r-md bg-primary p-2 text-black" type="submit">
                <LuSendHorizonal size={24} />
            </button>
        </form>
    );
}

export default ChatInput;