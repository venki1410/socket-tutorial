const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const { instrument } = require('@socket.io/admin-ui')
const io = new Server(server, {
	cors: {
		origin: ['https://admin.socket.io'],
	},
})

instrument(io, {
	auth: false,
})
const path = require('path')
const roomList = []
const roomList2 = []
const users = []

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

//nsp

app.get('/', (req, res) => {
	// res.sendFile(__dirname + '/index.html')
	res.render(path.join(__dirname, '/', 'index.html'), { rooms: roomList })
})

app.get('/room/', (req, res) => {
	var name = req.query.name
	var nsp = req.query.name
	res.render(path.join(__dirname, '/', 'rooms.html'), { rooms: name, nsp: nsp })
})

app.get('/addRoom/', (req, res) => {
	var name = req.query.name
	roomList.push(name)
	console.log(JSON.stringify(roomList))
	res.send(200)
})

const nameSpace = io.of(/^\/organisation-\d+$/)
nameSpace.on('connect', (socket) => {
	console.log('a user connected')
	console.log(socket.id)
	console.log(socket.nsp.name)

	socket.on('join', (data) => {
		socket.join(data.room)
		nameSpace
			.in(data.room)
			.emit('chat message', `New person joined the ${data.room} room`)
	})

	socket.on('disconnect', () => {
		console.log('user disconnected')
	})

	socket.on('chat message', (data) => {
		console.log('message: ' + data.msg)
		nameSpace.in(data.room).emit('chat message', data.msg)
	})

	socket.on('send message to all', (data) => {
		console.log('message: ' + data.msg)
		nameSpace.emit('chat message', data.msg)
	})
})

server.listen(3000, () => {
	console.log('listening on *:3000')
})
