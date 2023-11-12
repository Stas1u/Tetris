import { Timer, TimerEvent } from './moveHandler.js'
import { Tetris } from './tetris.js'
import { Board } from './board.js'

class game{
    __proto__ = null
    mods = !!JSON.parse(localStorage.getItem("mods"))
    inputs = []
    gameTime = new Timer()
    vKeys = [['a','d','q','e','s','w'], ["ArrowLeft", "ArrowRight", "Control", "Shift", "ArrowDown", "ArrowUp"]]
    players = []
    timeCount = new TimerEvent()
    status
    points = JSON.parse(localStorage.getItem("points")) || [10, 150]
    getFirst(player){
        for(const key of this.inputHandler.inputs)
            if(this.vKeys[player].includes(key))
                return key
        return false
    }
    constructor(playersCount){
        const time = +localStorage.getItem("time") || false


        for(let i=0; i< playersCount; i++){
            this.players.push({tetris: new Tetris(this), events: new TimerEvent()})
            // alert(this.mods)
            if(this.mods)
                this.players[i].modsEvent = new TimerEvent()
        }
        
        // const shuffle = array => {
        //     let currentIndex = array.length,  randomIndex
          

        //     while (currentIndex != 0) {
        //       randomIndex = Math.floor(Math.random() * currentIndex)
        //       currentIndex--
        //       [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
        //     }
          
        //     return array
        //   }
        const moveHandler = e => {
            const btn = e.key
            if(!this.vKeys[0].concat(this.vKeys[1]).includes(btn)){
                if(btn === " "){
                    const change = this.status === "stopped"? "start": "stop"

                    for(const {events, modsEvent} of this.players){
                        events && events[change]()
                        modsEvent && modsEvent[change]()
                    }
                    this.gameTime[change]()
                
                    this.status = change === "start"? "started": "stopped"
                    Board.changePauseScreen()
                }
                return 0
            }
            
            if(this.vKeys[0].includes(btn))
                this.inputs[0] = btn
            else if (this.vKeys[1].includes(btn))
                this.inputs[1] = btn

            for(const [key, player] of this.players.entries()){
                const {tetris} = player
                
                if(+player)
                    continue
                
                let moves  = tetris.getMoves()
            
                const input = this.vKeys[key].indexOf(this.inputs[key])
                if(input !== -1){
                    moves[input]()
                    this.inputs[key] = null
                }
            }
        }

        Board.showStartScreen.then(() =>{
            if(time){
                this.timeCount.on(time*100,function(){
                    const points = this.players.map(el => el.tetris.points)
                    if(points[0] > points[1])
                        this.end(1)
                    else
                        this.end(2)
                }, this)
                this.timeCount.start()
            }
            const gameSpeed = JSON.parse(sessionStorage.getItem("settings"))?.gameSpeed || 5
            for(const player of this.players){
                player.events.on(110 - 10*gameSpeed, function(){
                    this.tetris.down()
                    this.events.reset()
                }, player)
                player.modsEvent?.on(1250 , function(){   //250 ~= 1s
                    this.tetris.mods.generate(this.tetris.board)
                    this.modsEvent.reset()
                }, player)

                player.modsEvent?.start()
                player.events.start()
            }

            parent.window.onkeydown = moveHandler
            window.onkeydown = moveHandler

            this.status = "started"
            this.gameTime.start()
        })
    }
    end(winner){
        const screen = document.getElementById("game-over-screen")
        const output = screen.querySelector("div")
        // console.log(screen)
        
        output.style["color"] = winner===1? "red": "blue"
        output.innerHTML = `Player ${winner} wins`

        // alert(`winner: ${winner}`)
        screen.toggleAttribute("show")
        this.gameTime.stop()
    }
}
new game(2)


// Board.showStartScreen.then(val => alert(200))
