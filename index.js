import Express from 'express'
import path, { dirname } from 'node:path'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import cors from 'cors'
import { fileURLToPath } from 'node:url'
import { userController } from './src/userController.js'
import { verifyTokenSocket } from './utils/auth.js'
import { messageController } from './src/messageController.js'

const app = Express()
const port = 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.use(cors())
app.use(Express.json())
app.use(Express.static(path.join(__dirname, 'utils')))

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

const connectedUsers = {}

// Middleware para verificar el token en Socket.IO
io.use(verifyTokenSocket)

// Gestión de conexiones al socket
io.on('connection', (socket) => {
  const username = socket.user.username
  connectedUsers[socket.id] = username // Agrega al usuario conectado

  // Emitir mensaje global y lista de usuarios conectados
  io.emit('message', `User ${username} connected`)
  io.emit('updateUsers', Object.values(connectedUsers)) // Lista de usuarios conectados

  console.log(`User ${username} connected`)

  // Escuchar eventos de desconexión
  socket.on('disconnect', () => {
    console.log(`User ${username} disconnected`)
    delete connectedUsers[socket.id] // Elimina al usuario desconectado
    io.emit('message', `User ${username} disconnected`)
    io.emit('updateUsers', Object.values(connectedUsers)) // Lista actualizada
  })

  // Escuchar mensajes enviados por los clientes
  // En el evento 'message' del servidor
  socket.on('message', async (data) => {
    const mensajeConUsuario = {
      username: socket.user.username, // Asegúrate de que el username esté disponible
      data: data
    }

    // Guardar el mensaje en la base de datos (si usas una)
    await messageController.crearMensaje(socket.user.username, data)

    // Emitir a todos los clientes
    io.emit('message', mensajeConUsuario)
  })
})

// Rutas para las páginas y la API
const router = Express.Router()

router.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, './pages/chat.html'))
})

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, './pages/login.html'))
})

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, './pages/register.html'))
})

router.post('/login', userController.login)
router.delete('/user/:id', userController.eliminarUsuario)
router.post('/register', userController.crearUsuario)

router.get('/messages', messageController.getAllMessages)

app.use('/api', router)

// Iniciar el servidor
server.listen(port, () => {
  console.log('Running at port', `${port}`)
})
