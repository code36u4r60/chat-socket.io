import express, {json} from "express";
import {createServer} from "http";
import {Server, Socket} from "socket.io";
import {v4 as uuid} from 'uuid';

const app = express();
app.use(json())

const server = createServer(app)
const io = new Server(server);

interface IMessage {
    id?: number;
    username: string;
    message: string;
}

interface ISession {
    id: string;
    username: string;
}

const messages : IMessage[] = [];


io.on('connection', (socket: Socket) => {

    console.log('[IO] Connection => Server has a new connection')
    io.emit('chat.oldMessages', messages);

    socket.on('chat.message', (msg : IMessage) => {
        const newMessage = {
            id: messages.length + 1,
            username: msg.username,
            message: msg.message
        }

        messages.push(newMessage);
        io.emit('chat.message', newMessage)
    })

    socket.on('disconnect', (message) => {
        console.log('[SOCKET] disconnect => A connection was disconnected')
    })
});


const SERVER_PORT = 3443;
const SERVER_HOST = 'localhost';
server.listen(
    SERVER_PORT,
    SERVER_PORT,
    () => {
        console.log(`[HTTP] listen => Server is running at http://${SERVER_HOST}:${SERVER_PORT}`);
        console.log(`[HTTP] listen => Press CTRL+C to stop it`);
    });
