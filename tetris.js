import { Figure } from './fig.js'
import { Board } from './board.js'
import { Modulators } from './modulators.js'

export class Tetris{
    constructor(game){
        this.game = game
        this.el = Board.create
        this.ctx = this.el.getContext("2d")
        this.board = Array.from(new Array(20), el => new Array(10).fill(0))
        this.styleBoard = Array.from(new Array(20), el => new Array(10).fill(0))
        this.current = new Figure()
        this.nextBlock = new Figure()
        this.holded = {block: null, count: 0, color: null}
        this.shadow = Object.assign({}, this.current)
        this.points = 0
        this.lines = 0
        this.status = "started"
        this.colors = new Array(2).fill(this.color)

        this.mods = JSON.parse(localStorage.getItem("mods"))? new Modulators(JSON.parse(localStorage.getItem("mods"))): null
        if(this.mods){
            this.mods.generate(this.board)
            this.effects = new Array()
        }

    }
    get color(){
        return Math.floor(Math.random() * 7)+1
    }
    placeShadow(){
        this.shadow.shiftI = this.current.shiftI
        
        while(!this.collision(this.shadow) && this.shadow.shiftI < 21 - this.shadow.value.length)
            this.shadow.shiftI++

        this.shadow.shiftI--
    }
    collision({value: tab,shiftI,shiftJ}){
        let collision = false
        const allBoard = this.mods? this.board.map((subTab, i) => subTab.map((block, j) => {
            const freezeBlock = this.mods?.freezeBlock
            if(freezeBlock && i > 15 && freezeBlock?.value[i-freezeBlock?.shiftI][j-freezeBlock.shiftJ] === 1)
                return 1
            else
                return this.mods.ironBoard[i][j]? 1: block
        })): this.board


        tab.forEach((subTab,i) => subTab.forEach((ob, j) => {
            const field = allBoard[shiftI+i]? allBoard[shiftI+i][shiftJ+j]: 0
            if(field === 1 && field === ob)
                collision = true
        }))
        return collision
    }
    get isLine(){
        for(const [index, line] of this.board.entries())
            if(line.length === line.reduce((pre, curr) => pre += curr))
                return index
        return -1
    }
    checkLine(){
        let line = this.isLine
        while(line !== -1){
            this.board.splice(line, 1)
            this.board.unshift(new Array(10).fill(0))

            this.styleBoard.splice(line, 1)
            this.styleBoard.unshift(new Array(10).fill(0))

            this.points += this.game.points[1]
            this.lines++

            line = this.isLine
        }
    }

    baseMove(callback){
        Board.showNextBlock(this.el, this.nextBlock.value, this.colors[1])
        Board.showSecondNextBlock(this.el, this.holded.block, this.holded.color)
        

        this.placeShadow()
        callback()
        this.placeShadow()

        if(this.status === "end")
            return 0

        if(this.mods?.currentMods)
            Board.addMods(this.ctx, this.mods.currentMods)
        
        Board.draw(this,this.ctx, this.styleBoard, this.shadow, this.current, this.colors[0])

        //mods
        if(this.effects?.map(el => el.type).includes("fog"))
            Board.showFog(this.ctx, this.board)
        if(this.mods?.ironBoard.map(el => el.reduce((pre, curr) => pre += curr)).filter(el => el).length)
            Board.drawIronBoard(this.mods.ironBoard, this.ctx)
        if(this.mods?.freezeBlock)
            Board.drawFreezeBoard(this.mods.freezeBlock, this.ctx)
        if(this.mods?.lavaBlocks)
            Board.drawLavaBlock(this.mods.lavaBlocks, this.ctx)
    }
    rotate(side){
        this.baseMove(() =>{
            const test = Figure.rotate(Object.assign({}, this.current), side)
            if(!this.collision(test) && test.shiftI + test.value.length < 21){
                while(test.shiftJ + test.value[0].length > 10)
                    test.shiftJ--
                    
                this.current = Figure.rotate(this.current, side)
                this.current.shiftJ = test.shiftJ
                this.shadow = Figure.rotate(this.shadow, side)
                this.shadow.shiftJ = test.shiftJ
            }
        })
    }
    moveX(side){
        this.baseMove(() =>{
            if((side==="left" && this.shadow.shiftJ > 0 && !this.collision({value: this.current.value, shiftI: this.current.shiftI, shiftJ: this.current.shiftJ-1})) || (side==="right" && this.shadow.shiftJ < 10-this.current.value[0].length && !this.collision({value: this.current.value, shiftI: this.current.shiftI, shiftJ: this.current.shiftJ+1}))){
                this.current.shiftJ += side==="left"? -1: 1
                this.shadow.shiftJ += side==="left"? -1: 1
            }
        })
    }
    down(){
        this.baseMove(() =>{
            if(this.current.shiftI >= this.shadow.shiftI){
                const n = this.current.value.flat().reduce((pre, curr) => pre += curr)  
                this.points += this.game.points[0]*n

                if(this.current.shiftI <= 0)
                    this.end()
                else{
                    const opponent = this.game.players[+!this.id]

                    if(!this.current.iron){
                        this.addToBoard(this.current)
                        this.checkLine()
                    }
                    else
                        this.mods.addToIronBoard(this.current)
                    
                    if(this.mods){
                        this.mods.modHandler(this)
                        
                        for(const [key,effect] of this.effects.entries()){
                            effect.time--
                            if(!effect.time){
                                this.effects.splice(key, 1)
                                this.mods.ereaseMod(this, effect.type)
                            }
                            
                        }


                    }
                    this.current = Object.assign({}, this.nextBlock)
                    this.shadow = Object.assign({}, this.current)
                    this.nextBlock = new Figure()
                    this.holded.count = 0

                    this.colors.shift()
                    this.colors.push(this.color)

                    if(this.points > +opponent){
                        this.status = "end"
                        this.game.players[this.id].events.stop()
                        this.game.end(this.id+1)
                    }
                }

                Board.showPoints(this.el, this.points)
                Board.showLines(this.el, this.lines)
                
            }
            else
                this.current.shiftI++
        })
    }
    hold(){
        if(!this.holded.count){
            if(!this.holded.block){
                this.holded.block =  Array.from(this.current.value)
                this.holded.color = this.colors.shift()
                this.colors.push(this.color)

                this.current.value = this.nextBlock.value
                this.shadow.value = this.current.value
                
                this.nextBlock = new Figure()
            }
            else{
                const pom = JSON.parse(JSON.stringify(this.holded.block))
                this.holded.block = this.current.value
                this.current.value = pom
                this.shadow.value = this.current.value
                 
                const colPom = this.colors[0]
                this.colors[0] = this.holded.color
                this.holded.color = colPom
            }

            this.holded.count = 1
        }
    }
    atBottom(){
        this.baseMove(() =>{
            this.current.shiftI = this.shadow.shiftI
        })
    }
    addToBoard = ({value: tab, shiftI, shiftJ}) => tab.forEach((subTab,i) => subTab.forEach((ob, j) => 
        ob && (this.board[shiftI+i][shiftJ+j] = 1) && (this.styleBoard[shiftI+i][shiftJ+j] = this.colors[0])
    ))
    end(){
        this.status = "end"
        Board.showEnd(this.el, this.points)

        const opponent = this.game.players[+!this.id]
        if(+opponent)
            this.game.end(+!this.id)

        this.game.players[this.id].events.stop()
        this.game.players[this.id].events.stop()
        this.game.players[this.id] = this.points
    }
    get id(){
        return this.game.players.findIndex(el => el.tetris === this)
    }
    getMoves(){
        return [() => this.moveX("left"), () => this.moveX("right"), () => this.rotate("left"), () => this.rotate("right"),() => this.atBottom(), () => this.hold()]
    }
}