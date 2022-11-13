const socket = io.connect('http://localhost:3000')

const username = prompt('Enter your username')
const enemy = prompt('enter your friends name')
socket.emit('username', {
    username: username,
    enemy: enemy
})

socket.on('acp', data => {
    const tr = confirm(data.msg)
    console.log(data)
    if (tr === true) {
        // console.log("oyuna sok")
        socket.emit('acp', {
            username: data.username,
            enemy: data.enemy
        })
    } 
})

socket.on('accept', data => {
    console.log(data)
    const cf = confirm(data.msg)
    if (cf === true) {
        socket.emit('accept', 31)
    } else if(cf === false) {
        socket.emit('accept', 13)
    }
})
socket.on('game-ready', data=> {
    console.log(data)
})