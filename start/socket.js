const server = use('Server')
const { Server } = require('socket.io')
const WSController = use('App/Controllers/Http/FaceRecognitionController')
const Env = use('Env')

const io = new Server(server.getInstance(), {
    cors: {
        origin: Env.get('REMOTE_SOCKET_ORIGIN', 'http://127.0.0.1:3333'), // Change this to your desired origin(s)
        methods: ["GET", "POST"],
        credentials: true
    },
});

io.listen(Env.get('REMOTE_SOCKET_PORT', '8086'));
io.on('connection', function (socket) {
    WSController.checkSocket(socket, io)
})
