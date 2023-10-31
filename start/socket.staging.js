const server = use('Server')
const io = require('socket.io')(server.getInstance())
const WSController = use('App/Controllers/Http/FaceRecognitionController')
const Env = use('Env')

io.on('connection', function (socket) {
    WSController.checkSocket(socket, io)
})
