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

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

app.get('/', (req, res) => {
	// res.sendFile(__dirname + '/index.html')
	res.render(path.join(__dirname, '/', 'index.html'), { rooms: roomList })
})

app.get('/executive', (req, res) => {
	res.sendFile(__dirname + '/executive.html')
})

app.get('/engineer', (req, res) => {
	res.sendFile(__dirname + '/engineer.html')
})

app.get('/room/', (req, res) => {
	var name = req.query.name
	res.render(path.join(__dirname, '/', 'rooms.html'), { rooms: name })
})

app.get('/addRoom/', (req, res) => {
	var name = req.query.name
	roomList.push(name)
	console.log(JSON.stringify(roomList))
	res.send(200)
})

const adminNameSpace = io.of('/admin')
adminNameSpace.on('connect', (socket) => {
	//console.log('a user connected')

	socket.on('join', (data) => {
		socket.join(data.room)
		adminNameSpace
			.in(data.room)
			.emit('chat message', `New person joined the ${data.room} room`)
	})

	socket.on('disconnect', () => {
		console.log('user disconnected')
	})

	socket.on('chat message', (data) => {
		console.log('message: ' + data.msg)
		adminNameSpace.in(data.room).emit('chat message', data.msg)
	})

	socket.on('send message to all', (data) => {
		console.log('message: ' + data.msg)
		adminNameSpace.in('executive').in('engineer').emit('chat message', data.msg)
	})
})

server.listen(3000, () => {
	console.log('listening on *:3000')
})
