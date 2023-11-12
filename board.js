export class Board{
    static get create(){
        const gameEl = document.createElement("div")
        gameEl.classList.add("game-block")

        gameEl.innerHTML = `
            <div class="panel">
                <fieldset score><legend>Score</legend><span>000000</span></fieldset>
                <fieldset lines><legend>Lines</legend><span>0</span></fieldset>
                <fieldset next><legend>Next</legend></fieldset>
                <fieldset hold><legend>Hold</legend></fieldset>
            </div>
            <div class="center"></div>`

        const canvas = document.createElement("canvas")

        canvas.setAttribute('width', 200)
        canvas.setAttribute('height', 400)

        gameEl.querySelector(".center").append(canvas)

        document.querySelector("main").append(gameEl)

        return canvas
    }
    static drawEvery(tab, ctx, shift = [0,0], color, border){
        if(tab.map(el => el.reduce((pre, curr) => pre += curr)).reduce((pre, curr) => pre += curr))
            for (const [y, subTab] of tab.entries())
                for(const [x, block] of subTab.entries()){
                    if(border){
                        ctx.save()
                        ctx.strokeStyle = "white"
                        ctx.strokeRect( 20*(x+shift[1]), 20*(y+shift[0]), 20, 20)
                        ctx.restore()
                    }
                    if(block){
                        if(color === "shadow"){
                            ctx.save()
                            ctx.fillStyle = "rgb(0,0,0,.65)"
                            ctx.fillRect( 20*(x+shift[1]), 20*(y+shift[0]), 20, 20)
                            ctx.restore()
                        }
                        else{
                            const img = new Image()
                            img.src = `./data/img/block_${color || block}.png`
                            ctx.drawImage(img, 20*(x+shift[1]), 20*(y+shift[0]), 20, 20)
                        }
                    }
                }
    }
    static drawBackground(ctx, x, y){
        const img = new Image()
        img.src = "./data/img2/tetris_background.png"
        ctx.drawImage(img, x*30, y*30, 30, 30, x*20, y*20, 20, 20)
        // ctx.save()
        // ctx.fillStyle = "black"
        // ctx.fillRect(x*20, y*20, 20, 20)
        // ctx.restore()
    }
    static draw(player, ctx ,tab,{value: shadow, shiftI: sI, shiftJ: sJ},{value: current, shiftI: i, shiftJ: j, iron}, color){
        Board.clear(player)

        Board.drawEvery(tab,ctx)
        if(iron)
            Board.drawEvery(current, ctx, [i,j], "iron")
        else
            Board.drawEvery(current,ctx, [i,j],color)
        Board.drawEvery(shadow, ctx, [sI, sJ],"shadow")
    }
    static clear(player){
        
        const tab = JSON.parse(JSON.stringify(player.board))
        if(player.mods){
            for(let i=0; i<20; i++)
                for(let j=0; j<10; j++)
                    if(player.mods.ironBoard[i][j])
                        tab[i][j] = player.mods.ironBoard[i][j]

            for(const mod of player.mods.currentMods)
                tab[mod.shiftI][mod.shiftJ] = 1
        }

        for(const [i, subTab] of tab.entries())
            for(const [j, block] of subTab.entries())
                if(!block)
                    Board.drawBackground(player.ctx, j, i)
        player.ctx.restore()
    }
    static showPoints(el, points){
        points = Array.from(points.toString())
        while(points.length < 6)
            points.unshift("0")
        
        el.closest(".game-block").querySelector("[score]").innerHTML = `<legend>Score</legend><span>${points.reduce((pre, curr) => pre += curr)}</span>`
    }
    static showLines(el, lines){
        el.closest(".game-block").querySelector("[lines]").innerHTML = `<legend>Lines</legend><span>${lines}</span>`
    }
    static showEnd(el, points){
        const endBlock = document.createElement("div")
        endBlock.classList.add("game-over")
        endBlock.innerHTML = `<h1>Game Over</h1>Points: ${points}`

        el.parentElement.append(endBlock)
    }
    static showBlock(target, type, arr, color){
        arr = arr || [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
        arr = arr.map(el => el.concat(new Array(4-el.length).fill(0)))
        arr = arr.concat(new Array(4-arr.length).fill(new Array(4).fill(0)))

        target.innerHTML = `<legend>${type}</legend>`

        const canvas = document.createElement("canvas")

        canvas.setAttribute("width",80)
        canvas.setAttribute("height",80)
        canvas.style["transform"] = "scale(.7)"

        target.append(canvas)
        Board.drawEvery(arr, canvas.getContext("2d"), [0,0], color, true)
    }
    static showNextBlock = (el, arr,color) => Board.showBlock(el.closest(".game-block").querySelector("[next]"), "Next", arr, color)
    static showSecondNextBlock = (el,arr, color) => Board.showBlock(el.closest(".game-block").querySelector("[hold]"), "Hold", arr, color)
    static get showStartScreen(){
        const promise = new Promise((resolve) => {
            const screen = document.getElementById("screen")
            let time = 3

            const timer = setInterval(function(){
                time -= 1
                screen.querySelector("span").innerHTML = time
                if(!time){
                    clearInterval(timer) 
                    screen.style["display"] = "none"
                    resolve()
                }
            }, 1000)

            
        })
        return promise
    }
    static changePauseScreen = () => document.getElementById("pause-screen").toggleAttribute("paused")
    static addMods(ctx, mods){
        for(const {shiftI: i, shiftJ: j, type} of mods){
            const img = new Image()
            img.src = `./data/img2/${type}_mod.png`

            Board.drawBackground(ctx, j, i)
            ctx.drawImage(img, j*20, i*20, 20, 20)
        }
    }
    static showFog(ctx, tab){
        let height
        for(const [i, row] of tab.entries())
            if(row.includes(1)){
                height = i
                break
            }
        height = (20 - height) || 1
        
        const img = new Image()
        img.src = `./data/img2/fog.png`
        ctx.save()
        ctx.fillStyle = "rgb(37, 37, 37)"
        ctx.fillRect(0, 400 - height*20, 200, height*20)
        ctx.drawImage(img, 0, 2000 - height*100, 1000, height*100, 0, 400 - height*20, 200, height*20)
        ctx.restore()
    }
    static drawIronBoard = (tab, ctx) => Board.drawEvery(tab, ctx, [0,0], "iron")
    static drawFreezeBoard = (block, ctx) => Board.drawEvery(block.value, ctx, [block.shiftI, block.shiftJ], "freeze")
    static drawLavaBlock(blocks, ctx){
        for(const {value: block, shiftI, shiftJ} of blocks)
            Board.drawEvery(block, ctx, [shiftI, shiftJ], "lava")
        
    }
}