const socket = io.connect('http://localhost:3000')
const numbs = [1,  2,  3,  4,  5,  6,  7,  8]
const ltrs = ["a","b","c","d","e","f","g","h"]


class Gameboard {
    constructor(a, i, j, piece, color){
        this.color = color
        this.piece = piece
        console.log(this.color)
        this.a = a;
        this.i = i;
        this.j = j;
        this.b = document.createElement('div');
        this.b.style.position = "relative"
        

        this.wh = document.createElement('div')
        

        if (this.piece !== null){
            this.b.style.backgroundImage = `url(/assets/${this.piece.color}${this.piece.type})`
            // this.b.textContent = this.piece.type
            // this.b.textContent = this.b.textContent.toUpperCase()
            // if (this.piece.color == "w"){
            //     this.b.style.color = "white"

            // } else {
            //     this.b.style.color = "black"
            // }
        }
        if (this.color == "white"){
            this.wh.style.fontSize = "10px";
            this.wh.style.position = "absolute";
            this.wh.textContent = ltrs[this.j]+numbs[7-this.i]

            this.b.id = ltrs[this.j]+numbs[7-this.i]
            console.log(this.b.id, 33)
            console.log("beyazsın")
        } else{
            this.wh.style.fontSize = "10px";
            this.wh.style.position = "absolute";
            this.wh.textContent = ltrs[this.j]+numbs[7-this.i]

            this.b.id = ltrs[this.j]+numbs[7-this.i]
            console.log("siyahsınn")
        }
        this.b.addEventListener('click', () => {
            if (this.color == "white"){
                //console.log(9-this.i)
                //console.log(ltrs[this.j]+numbs[7-this.i])
                socket.emit('move', ltrs[this.j]+numbs[7-this.i])
            } else {
                console.log("click")
                //console.log(ltrs[this.j]+numbs[this.i])
                socket.emit('move', ltrs[this.j]+numbs[7-this.i])
            }
            
            // console.log(ltrs[this.j]+numbs[this.i].toString())
               // socket ile taş tipi
        })
        // this.wh.style.width = "1px"
        // this.wh.style.height = "1px"
        this.wh.style.right = 0;
        this.wh.style.bottom = 0;
        this.b.appendChild(this.wh)
        if (this.i % 2 == 0){
            if (this.j % 2 == 0) {
                this.b.style.backgroundColor = "green";
            } else {
                this.b.style.backgroundColor = "gray";
            }
        } else {
            if (this.j % 2 == 1) {
                this.b.style.backgroundColor = "green";
            } else {
                this.b.style.backgroundColor = "gray";
            }
        }
        this.b.className = "items"
        this.a.appendChild(this.b)
    }
}


const gameDatas = document.getElementById('game-datas')
const board = document.getElementById('game-board')
const username = prompt('Enter your username')
socket.emit('fusername', username)

socket.on('find-game-ready', data => {
    console.log(data.msg)
    console.log(data.board)

    var color = data.color;
    console.log(color)
    gameDatas.textContent = `Siz: ${data.username}, Rakibiniz: ${data.enemy}, Renginiz: ${data.color}`

    for (var i = 0; i < 8; i++) {
        var a = document.createElement('div')
        a.className = "parents"
        board.appendChild(a)
        this.i = 7- this.i
        console.log(this.i)
        for (var j = 0; j < 8; j++) {
            var myClass = new Gameboard(a, i, j, data.board[i][j], color);
        }
    
    }
})

socket.on('isGameOver', data=> {
    alert(data)
})

socket.on('move', data => {
    console.log(data, "asasf")
    board.innerHTML = ""
    for (var i = 0; i < 8; i++) {
        var a = document.createElement('div')
        a.className = "parents"
        board.appendChild(a)
        for (var j = 0; j < 8; j++) {
            var clean = new Gameboard(a, i, j, data.board[i][j], data.color)
        }
    }
    data.legal.forEach((e) => {
        console.log(e)
        const piece = document.getElementById(e);
        console.log(piece)
        piece.style.backgroundColor = "red";
        piece.addEventListener('click', () => {

            console.log(piece.id, "aaaaa")
            socket.emit('play', {
                move: piece.id,
                piece: data.piece
            })
        })
    })
})

socket.on('newb', data => {
    console.log(data)
    var color = data.color
    board.innerHTML = ""
    for (var i = 0; i < 8; i++) {
        var a = document.createElement('div')
        a.className = "parents"
        board.appendChild(a)
        for (var j = 0; j < 8; j++) {
            var myClass = new Gameboard(a, i, j, data.board[i][j], color);
        }
    
    }
})
