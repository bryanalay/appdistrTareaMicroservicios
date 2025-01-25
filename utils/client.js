import './socketio.js'

const token = localStorage.getItem('token')
if (!token) {
  window.location.href = '/api/login'
}

// Elementos del DOM
const form = document.getElementById('form')
const input = document.getElementById('input')
const messages = document.getElementById('messages')
const userList = document.getElementById('userList')

const logoutBtn = document.getElementById('logoutBtn')
logoutBtn.addEventListener('click', (e) => {
  e.preventDefault()
  localStorage.removeItem('token') // Eliminar el token
  window.location.href = '/api/login' // Redirigir al login
})
// Conectar al socket y configurar listeners primero
const socket = io('http://localhost:3000', {
  auth: {
    token: token
  }
})

// Configurar los listeners inmediatamente después de conectar
socket.on('message', (msg) => {
  let contenido = msg

  // Si el mensaje es un objeto (nuevo formato), extrae username y contenido
  if (typeof msg === 'object' && msg.username && msg.data) {
    contenido = `${msg.username}: ${msg.data}`
  }

  const item = `<li>${contenido}</li>`
  messages.insertAdjacentHTML('beforeend', item)
  messages.scrollTop = messages.scrollHeight // Auto-scroll al final
})

socket.on('updateUsers', (users) => {
  userList.innerHTML = '' // Limpiar lista
  users.forEach((user) => {
    const userItem = `<li>${user}</li>`
    userList.insertAdjacentHTML('beforeend', userItem)
  })
})

socket.on('disconnect', () => {
  console.log('Desconectado del servidor')
  const item = `<li class="text-red-500">Desconectado del servidor</li>`
  messages.insertAdjacentHTML('beforeend', item)
})

// Luego, obtener los mensajes
const msjs = await fetch('http://localhost:3000/api/messages', {
  headers: {
    Authorization: `Bearer ${token}`
  },
  method: 'GET'
}).then((res) => res.json())

msjs.forEach((msg) => {
  const item = `<li>${msg.username + ': ' + msg.content}</li>`
  messages.insertAdjacentHTML('beforeend', item)
})

// Configurar el envío de mensajes
form.addEventListener('submit', (e) => {
  e.preventDefault()
  if (input.value) {
    socket.emit('message', input.value)
    input.value = ''
  }
})
