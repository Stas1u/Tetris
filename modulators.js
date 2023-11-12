import { Board } from "./board.js"
import { Figure } from "./fig.js"

export class Modulators{
    static modsList = ["lavaBlocks", "freezeBlocks", "ironBlock", "fog", "ereaser", "reverseBoard", "changeControl"]
    constructor(option){
        this.mods = Modulators.modsList.filter((val, i) => option[i])
        this.ironBoard = Array.from(new Array(20), el => new Array(10).fill(0))
        this.freezeBoard = null
        this.currentMods = new Array()
    }
    generate(tab){
        const random = (min,max) => Math.floor(Math.random() * (max-min+1)) + min
        const min = tab.map(el => el.reduce((pre, curr) => pre += curr)).reduce((pre, curr) => pre += curr) < 120? 6: 0
        let i, j

        do{
            i = random(min, 19)
            j = random(0,9)
        }while(tab[i][j])

        if(this.currentMods.length <= 10)
            this.currentMods.push({type: this.mods[random(0,this.mods.length-1)], shiftI: i, shiftJ: j})
    }
    addMod(opponent, type){
        if(!opponent)
            return 0
            
        switch(type){
            case "changeControl":
                const shuffle = tab =>{
                    let rI
                    for(let i=tab.length-1; i; i--){
                        rI = Math.floor(Math.random() * i)
                        ;[tab[i], tab[rI]] = [tab[rI], tab[i]]
    
                    }
                    return tab
                }

                const moves = shuffle(opponent.getMoves())
                opponent.getMoves = () => moves
                opponent.effects.push({type: "changeControl", time: 3})
                break
            case "reverseBoard":
                opponent.el.style["transform"] = "rotate(180deg)"
                opponent.effects.push({type: "reverseBoard", time: 3})
                break
            case "ereaser":
                const startJ = opponent.current.shiftJ, endJ = startJ + opponent.current.value.length

                for(let i=0; i<20; i++){
                    for(let j=startJ; j<endJ; j++){
                        opponent.board[i][j] = 0
                        opponent.styleBoard[i][j] = 0
                    }
                }

                Board.clear(opponent)
                Board.drawEvery(opponent.styleBoard, opponent.ctx)
                break
            case "fog":
                opponent.effects.push({type: "fog", time: 3})
                Board.showFog(opponent.ctx, opponent.board)
                break
            case "ironBlock":
                opponent.current.iron = true
                break
            case "freezeBlocks":
                const freezeBlocks = {value: Array.from(new Array(5), el => new Array(5).fill(0)), shiftJ: Math.floor(Math.random() * 5), shiftI: 15}

                for(let i=freezeBlocks.shiftI; i<20; i++)
                    for(let j = freezeBlocks.shiftJ; j < freezeBlocks.shiftJ + freezeBlocks.value[0].length; j++){
                        if(opponent.board[i][j]){
                            freezeBlocks.value[i-freezeBlocks.shiftI][j-freezeBlocks.shiftJ] = 1
                            opponent.board[i][j] = 0
                        }
                    }
                
                opponent.mods.freezeBlock = freezeBlocks
                opponent.effects.push({type: "freezeBlocks", time: 5})
                break
            case "lavaBlocks":
                const random = (min,max) => Math.floor(Math.random() * (max-min+1)) + min
                opponent.mods.lavaBlocks = new Array()
                
                for(let q=0; q<8; q++){
                    const block = new Figure().value, shiftI = random(6, 19 - block.length), shiftJ = random(0, 10-block[0].length)
                    opponent.mods.lavaBlocks.push({value: block, shiftI: shiftI, shiftJ: shiftJ})
                    for(const [i, subTab] of block.entries())
                        for(const [j, el] of subTab.entries())
                            if(el){
                                opponent.board[i+shiftI][j+shiftJ] = 0
                                opponent.styleBoard[i+shiftI][j+shiftJ] = 0
                            }
                }
                Board.drawLavaBlock(opponent.mods.lavaBlocks, opponent.ctx)
                setTimeout(() => {opponent.mods.lavaBlocks = null}, 400)
                break
        }
    }
    ereaseMod(player, type){
        switch(type){
            case "changeControl":
                player.getMoves = function(){return [() => this.moveX("left"), () => this.moveX("right"), () => this.rotate("left"), () => this.rotate("right"),() => this.atBottom(), () => this.hold()]}
                break
            case "reverseBoard":
                player.el.style["transform"] = "none"
                break
            case "freezeBlocks":
                player.addToBoard(this.freezeBlock)
                this.freezeBlock = null
                player.checkLine()
                break
        }
    }

    modHandler(player){
        const opponent = player.game.players[+!player.id].tetris
        const mods = this.modsIn(player.current)
        for(const mod of mods){
            this.addMod(opponent, mod.type)
            this.currentMods.splice(this.currentMods.indexOf(mod), 1)
        }

    }
    modsIn({value: block, shiftI, shiftJ}){
        const mods = new Array()
        for(const [i, tab] of block.entries())
            for(const [j, el] of tab.entries())
                if(el)
                    for(const mod of this.currentMods)
                        if(i+shiftI === mod.shiftI && j+shiftJ === mod.shiftJ)
                            mods.push(mod)
        return mods
    }
    addToIronBoard = ({value: tab, shiftI, shiftJ}) => tab.forEach((subTab,i) => subTab.forEach((ob, j) => 
        ob && (this.ironBoard[shiftI+i][shiftJ+j] = 1)
    ))
}