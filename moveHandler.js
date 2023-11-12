export class Timer{
    time = 0;
    stopped = true;

    reset(){this.time = 0}
    stop(){this.stopped = true}
    use(){
        if(!this.stopped){
            this.time++
            const min = Math.floor(this.time/60)
            const sec = this.time%60
            
            document.getElementById("timer").innerText = `${min<10? "0"+min:min}:${sec<10? "0"+sec: sec}`
            setTimeout(() => this.use(), 1000)
        }
    }
    start(){
        this.stopped = false
        this.use()
    }
}
export class TimerEvent extends Timer{
    events = new Object()

    on(x, callback, context = null){
        this.events[x] = callback.bind(context)
    }
    use(){
        if(!this.stopped){
            if(this.events[this.time])
                this.events[this.time]()

            this.time++
            setTimeout(() => this.use(), 1)
        }
    }
    
}


// export class MoveHandler{
//     __proto__ = null
//     timerEvent = new TimerEvent()
//     input
//     gameTime = new Timer()

//     constructor(game){

//         this.game = game
        
//         window.onkeydown = e =>{
//             this.input = this.validKeys.includes(e.key.toUpperCase())? e.key: null
//             if(this.input){
//                 this.inputHandling()
//                 this.timerEvent.reset()
//             }
//         }

//         const gameSpeed = JSON.parse(sessionStorage.getItem("settings"))?.gameSpeed || 5


//         console.log(gameSpeed)
//         this.timerEvent.on(110 - 10 * gameSpeed, function(){
//             if(this.game.status !== "end"){
//                 this.game.down()
//                 this.timerEvent.reset()
//             }
//         }, this)

//         this.gameTime.start()
//         this.timerEvent.start()
//         this.validKeys = JSON.parse(sessionStorage.getItem("settings"))?.keys ||  ['A','D','Q','E','S','W'," "]
//     }
//     inCase = n => this.input === n.toLowerCase() || this.input === n.toUpperCase()
//     inputHandling(){
//         if(this.game.status !== "end"){
//             if(this.inCase(this.validKeys[0]))
//                 this.game.moveX("left")
//             else if(this.inCase(this.validKeys[1]))
//                 this.game.moveX("right")
//             else if(this.inCase(this.validKeys[2]))
//                 this.game.rotate("left")
//             else if(this.inCase(this.validKeys[3]))
//                 this.game.rotate("right")
//             else if(this.inCase(this.validKeys[4]))
//                 this.game.atBottom()
//             else if(this.inCase(this.validKeys[5]))
//                 this.game.hold()
//             else if(this.input === " "){
//                     if(this.timerEvent.stopped){
//                         this.timerEvent.start()
//                         this.gameTime.start()
//                     }
//                     else{
//                         this.timerEvent.stop()
//                         this.gameTime.stop()
//                     }
//             }
//             this.input = null
//         }  
//     }

// }