const server = use('Server')
const { Server } = require('socket.io')
const WSController = use('App/Controllers/Http/FaceRecognitionController')

const io = new Server(server.getInstance(), {
    cors: {
        origin: "http://127.0.0.1:3333", // Change this to your desired origin(s)
        methods: ["GET", "POST"],
        credentials: true
    },
});

io.listen(4000);
io.on('connection', function (socket) {
    console.log("HAAAA");
    WSController.checkSocket(socket, io)
})
