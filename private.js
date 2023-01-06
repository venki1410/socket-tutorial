const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index2.html')
})

io.on('connection', (socket) => {
	console.log('user connected  ' + socket.id)
	socket.on('chat message', (msg) => {
		console.log('message: ' + msg)
		io.to(socket.id).emit('chat message', msg)
	})
})

server.listen(4000, () => {
	console.log('listening on *:3000')
})
