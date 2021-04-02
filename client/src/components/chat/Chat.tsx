import './styles.scss'
import {useEffect, useState} from "react";
import {v4 as uuid} from 'uuid';
import io from 'socket.io-client';


interface IMessage {
    id?: number;
    username: string;
    message: string;
}

interface ISession {
    id: string;
    username: string;
}


const socket = io('http://localhost:3443', {transports: ['websocket'], autoConnect: false})

socket.on('connect',
    () => console.log('[IO] connect => A new connection has been established')
)

export default function Chat() {

    const [username, setUsername] = useState('');
    const [session, setSession] = useState<ISession>({
        id: '',
        username: ''
    });

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Array<IMessage>>([]);

    useEffect((): any => {
        const handleNewMessage = (newMessage: IMessage) => {
            setMessages([...messages, newMessage]);
        }

        const handleOldMessages = (oldMessages: IMessage[]) => {
            setMessages([...oldMessages]);
        }


        socket.on('chat.message', handleNewMessage)
        socket.on('chat.oldMessages', handleOldMessages)
        return () => socket.off('chat.message', handleNewMessage)
    }, [messages])

    const connect = () => {
        socket.connect();
    }

    const handleInputChange = (event: any) => {
        setMessage(event.target.value)
    }

    const handleInputUsernameChange = (event: any) => {
        setUsername(event.target.value);
    }

    const handleFormSubmit = (event: any) => {
        event.preventDefault();
        if (message.trim()) {
            const msg: IMessage = {
                message,
                username: session.username
            }
            socket.emit('chat.message', msg)
        }
        setMessage("");
    }

    const handleFormUsernameSubmit = (event: any) => {
        event.preventDefault();
        if (username.trim()) {
            const session: ISession = {
                username,
                id: uuid()
            }
            connect();
            setSession(session);

        }
        setMessage("");
    }

    return (
        <main className="chatContainer">
            <ul>
                {messages.map(msg =>
                    (
                        <li
                            key={msg.id}
                            className={msg.username === session?.username ? 'mine' : ''}>
                        <span className="message">
                            <h4>{msg.username}</h4>
                            {msg.message}
                        </span>
                        </li>
                    )
                )}
            </ul>
            {!session.username ? (
                <form action="" onSubmit={handleFormUsernameSubmit}>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        onChange={handleInputUsernameChange}
                        value={username}
                    />
                </form>) : (
                <form action="" onSubmit={handleFormSubmit}>
                    <input
                        type="text"
                        placeholder="Type a new message here"
                        onChange={handleInputChange}
                        value={message}
                    />
                </form>)}
        </main>
    )
}