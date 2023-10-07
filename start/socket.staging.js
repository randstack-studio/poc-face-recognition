const server = use('Server')
const io = require('socket.io')(server.getInstance())
const WSController = use('App/Controllers/Http/FaceRecognitionController')
const Env = use('Env')

//const io = new Server(server.getInstance(), {
//    cors: {
//        origin: "https://lens.staging.endavolabs.com", // Change this to your desired origin(s)
//        methods: ["GET", "POST"],
//        credentials: true,
//    },
//});

//io.listen(8086);

io.on('connection', function (socket) {
    WSController.checkSocket(socket, io)
})
