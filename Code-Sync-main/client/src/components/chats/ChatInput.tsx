import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { useSocket } from "@/context/SocketContext"
import { ChatMessage } from "@/types/chat"
import { SocketEvent } from "@/types/socket"
import { formatDate } from "@/utils/formateDate"
import { FormEvent, useRef, useState } from "react"
import { LuSendHorizonal } from "react-icons/lu"
import { FiMic } from "react-icons/fi"
import { v4 as uuidV4 } from "uuid"

function ChatInput() {
    const { currentUser } = useAppContext()
    const { socket } = useSocket()
    const { setMessages } = useChatRoom()
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [audioChunks, setAudioChunks] = useState<Blob[]>([])

    const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const inputVal = inputRef.current?.value.trim()

        if (inputVal && inputVal.length > 0) {
            const message: ChatMessage = {
                id: uuidV4(),
                message: inputVal,
                username: currentUser.username,
                timestamp: formatDate(new Date().toISOString()),
                type: "text",
            }
            socket.emit(SocketEvent.SEND_MESSAGE, { message })
            setMessages((messages) => [...messages, message])

            if (inputRef.current) inputRef.current.value = ""
        }
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            recorder.ondataavailable = (event) => {
                setAudioChunks((prev) => [...prev, event.data])
            }
            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/webm" })
                const audioUrl = URL.createObjectURL(audioBlob)

                const message: ChatMessage = {
                    id: uuidV4(),
                    message: audioUrl,
                    username: currentUser.username,
                    timestamp: formatDate(new Date().toISOString()),
                    type: "audio",
                }
                socket.emit(SocketEvent.SEND_MESSAGE, { message })
                setMessages((messages) => [...messages, message])
                setAudioChunks([])
            }
            recorder.start()
            setMediaRecorder(recorder)
        } catch (error) {
            console.error("Error accessing microphone: ", error)
        }
    }

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop()
            setMediaRecorder(null)
        }
    }

    return (
        <form
            onSubmit={handleSendMessage}
            className="flex justify-between rounded-md border border-primary"
        >
            <input
                type="text"
                className="w-full flex-grow rounded-md border-none bg-dark p-2 outline-none"
                placeholder="Enter a message..."
                ref={inputRef}
            />
            <button
                className="flex items-center justify-center rounded-r-md bg-primary p-2 text-black"
                type="submit"
            >
                <LuSendHorizonal size={24} />
            </button>
            <button
                className="flex items-center justify-center rounded-md bg-primary p-2 ml-2 text-black"
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
            >
                <FiMic size={24} />
            </button>
        </form>
    )
}