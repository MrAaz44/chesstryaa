const express = require('express')
const app = express()
const socket = require('socket.io')
const { Chess } = require('chess.js')


const server = app.listen(3000)
const io = socket(server)
const waitingpw = {}
const waitingfi = {}
const playingwith = {}
const wannaplay = {}
const ready = {}
const gamingwith = {} // kimle oynadığı
const games = {} // bütün oyun detayları
const gamebo = {} // sadece oyun tahtası
const gamecolor = {}

app.set('view-engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('index.ejs')
})
app.get('/find', (req, res) => {
    res.render('find.ejs')
})
app.get('/playwith', (req, res) => {
    res.render('playwith.ejs')
})
app.get('/assets/:asset', (req, res) => {
    res.sendFile(__dirname+'/public/assets/'+req.params.asset+".png")
})


io.on('connection', socket => {
    console.log(socket.id)

    socket.on('username', data => {
        // Wanna play with friend
        var username = data.username
        var enemy = data.enemy

        waitingpw[socket.id] = username // bekleme listesine alıyor (id yi kendi ismiyle eşleştiriyor)
        console.log(`${username}, ${enemy} ile birlikte oynamak istiyor kişi kontrolü yapılıyor`)
        wannaplay[socket.id] = enemy // kimle oynamak istediğini id ile eşleştiriyor

        // kişi giriş yaptığında birisinin onunla oynamak istediği kontrol edilmeli

        Object.keys(wannaplay).forEach(key => {
            console.log(wannaplay[key], key)
            if (username == wannaplay[key]) {
                // başka birisi bu kişinin katılmasını bekliyor
                if (waitingpw[key] !== undefined){
                    socket.emit('acp', {
                        msg:`${waitingpw[key]} isimli kişi size oyun daveti göndermiş kabul ediyor musunuz?`,
                        username: username,
                        enemy:waitingpw[key]
                    })
                }
            }
        })

        // davet ettiği kişiyi sorgula

        // enemy nin socket.id sini öğren

        Object.keys(waitingpw).forEach((key) => {
            console.log(key, waitingpw[key], "now")
            if (enemy == waitingpw[key]) {
                console.log(`${key} yani ${waitingpw[key]} e ${username} in oyun istediğini söyle`)
                io.to(key).emit('acp', {
                    msg: `${username} sizinle oyun oynamak istiyor ne dersin?`,
                    username: enemy,
                    enemy: username
                })
            }
        })

        // console.log(wannaplay)
        // console.log(waitingpw)
    })

    socket.on('acp', data=>{
        console.log(data, "kabul")
        var enmy = data.enemy
        Object.keys(waitingpw).forEach((key) => {
            if (enmy == waitingpw[key]) {
                console.log("aaaaaa", key, waitingpw[key], enmy)
                ready[socket.id] = key
                ready[key] = socket.id
                console.log(ready)
                io.to(key).emit('accept', {
                    msg: `${waitingpw[socket.id]} ile oyuna girmek istiyon mu?`,
                    username: enmy,
                    enemy: waitingpw[socket.id]
                })
            }
        })
    })

    socket.on('accept', data=> {
        if (data === 31) { // kabul
            console.log("kabul")
            // socket.id + ready[socket.id eşleşmesi]
            // console.log(socket.id, ready[socket.id], "3111")
            gamingwith[socket.id] = ready[socket.id]
            gamingwith[ready[socket.id]] = socket.id
            console.log(gamingwith)
            
            

            
            io.to(ready[socket.id]).emit('game-ready', `oyununuz hazır ${waitingpw[socket.id]} ile oyuna giriyorzunuz renginiz beyaz`)
            socket.emit('game-ready', `oyununuz hazır ${waitingpw[ready[socket.id]]} ile oyuna giriyorsunuz renginiz siyah`)

            delete ready[ready[socket.id]]
            delete ready[socket.id]
            console.log(ready)
        } else if (data === 13){ // red
            console.log("red")
            delete ready[socket.id]
            console.log(ready)
            Object.keys(ready).forEach((key) => {
                    if (ready[key] == socket.id) {
                        delete ready[key]
                        // console.log(ready, "aasdasd", ready[key])
                    }
                }
            )
        }
    })

    socket.on('fusername', username => {
        // Just find a game
        waitingfi[socket.id] = username
        console.log(waitingfi)
        
        if (Object.keys(waitingfi).length % 2 == 0) {
            console.log("eşleştir")
            var usr1 = Object.keys(waitingfi)[0]
            var usr2 = Object.keys(waitingfi)[1]


            const chess = new Chess()

            console.log(chess)
            var board = chess
            console.log(board.moves())

            gamecolor[usr1] = "w"
            gamecolor[usr2] = "b"

            games[usr1] = board
            games[usr2] = board
            

            gamebo[usr1] = games[usr1].board()
            gamebo[usr2] = games[usr2].board()

            console.log(games[usr1].turn(), games[usr2].turn())

            io.to(usr1).emit('find-game-ready', {
                msg:`Your game is ready you are playing with ${waitingfi[usr2]} your color is white`,
                board: gamebo[usr1],
                color: "white",
                isGameReady: true,
                username: waitingfi[usr1],
                enemy: waitingfi[usr2]
            })
            io.to(usr2).emit('find-game-ready', {
                msg:`Your game is ready you are playing with ${waitingfi[usr1]} your color is black`,
                board: gamebo[usr2],
                color: "black",
                isGameReady: true,
                username: waitingfi[usr2],
                enemy: waitingfi[usr1]
            })

            playingwith[usr1] = usr2
            playingwith[usr2] = usr1

            delete waitingfi[usr1]
            delete waitingfi[usr2]
            console.log(waitingfi)
        } else {
            console.log("oyuncu bekleniyor")
        }
    })
    socket.on('move', data=> {
        console.log("geldi")
        const enmy = playingwith[socket.id]
        if (games[socket.id].turn() == gamecolor[socket.id]){
            var liste = []
            var hamleler = games[socket.id].moves({square:data, verbose:true})
            hamleler.forEach((element) => {
                liste.push(element.to)
            })
            console.log(liste)
            
            socket.emit('move', {
                color: gamecolor[socket.id],
                board: gamebo[socket.id],
                legal: liste,
                piece: data
            })
        } else {
            console.log("hatalı sra")
        }
    })

    socket.on('play', data => { // data dan oynananacak yer move from piece den geliyor
        if (games[socket.id].turn() == gamecolor[socket.id]){
            const enemy = playingwith[socket.id]
            console.log(enemy, "aaa")
            
                games[socket.id].move({from: data.piece, to: data.move, promotion: 'q'})
                games[enemy].move({from: data.piece, to: data.move})
                if (gamecolor[socket.id] == "w"){
                    gamebo[socket.id] = games[socket.id].board()
                    gamebo[enemy] = games[enemy].board()
                } else {
                    gamebo[socket.id] = games[socket.id].board()
                    gamebo[enemy] = games[enemy].board()
                }
                console.log(games[socket.id].turn())
                console.log(games[enemy].turn())
                console.log(games[socket.id].isGameOver(), games[enemy].isGameOver())
                if (games[socket.id].isGameOver()) {
                    socket.emit('isGameOver', "oyun bitti kazandın")
                    io.to(enemy).emit('isGameOver', "oyun bitti kaybettin")
                }
                socket.emit('newb', {
                    board: gamebo[socket.id],
                    color: gamecolor[socket.id]
                })
                io.to(enemy).emit('newb', {
                    board: gamebo[enemy],
                    color: gamecolor[enemy]
                })
        } else {
            console.log("hatalı hamle")
        }
        console.log(data, "aaa", gamebo[socket.id])
    })


    socket.on('disconnect', () => {
        if (waitingfi[socket.id]) {
            // find gameden çıktı
            console.log("find game den ayrıldı")
            delete waitingfi[socket.id]
        } else if (waitingpw) {
            //play with den çıktı
            console.log("play with den ayrıldı")
            delete waitingpw[socket.id]
        }
        // console.log(waitingpw)
        // console.log(waitingfi)
    })
})
