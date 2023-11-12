if(!localStorage.getItem("blocks")){
    const base = [[[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],[[0,0,0,0],[0,1,1,0],[0,0,1,1],[0,0,0,0]],[[0,1,0,0],[0,1,1,0],[0,1,0,0],[0,0,0,0]],[[0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]],[[0,1,0,0],[0,1,0,0],[0,1,1,0],[0,0,0,0]]]
    localStorage.setItem("blocks", JSON.stringify(base))
}
const toMultiArray = arr =>{
    const iter = arr[Symbol.iterator]()
    const pattern = [[], [], [], []]

    for(let i=0; i<16; i++)
        pattern[Math.floor(i/4)].push(iter.next().value)

    return pattern
}
function createBoardPattern(arr, num=-1){
    const pattern = document.createElement("div")
    const btns = num===-1? `<button formmethod="dialog" edit="${num}">&#10004;</button><button formmethod="dialog" delete="${num}">&#10008;</button>`: `<span>✎</span><span>&#10008;</span>`// ["Save", "Canel"]: ["Edit", "Delete"]

    let svg =  `<svg>`
    for(const [y, subArr] of arr.entries())
        for(const [x, el] of subArr.entries())
            svg += `<rect style="fill:${el? "blue": "transparent"};stroke:white;stroke-width:1.2%" width="25%" height="25%" x="${x * 25}%" y="${y * 25}%" />`
    pattern.innerHTML += svg + `</svg>${btns}`

    if(num !== -1){
        pattern.classList.add("blocks")

        pattern.querySelector("span").onclick = e => showEditPanel(num)
        pattern.querySelector("span:last-of-type").onclick = e =>{
            const blocks = JSON.parse(localStorage.getItem("blocks"))
            blocks[num] = 0
            localStorage.setItem("blocks", JSON.stringify(blocks))
            addBlocks()
        }
    }
    else
        pattern.querySelector("svg").onclick = e => e.target.style["fill"] = e.target.style["fill"] === "blue"? "transparent": "blue"
    return pattern
}
function showEditPanel(id){
    const block = JSON.parse(localStorage.getItem("blocks"))[id] || new Array(4).fill([0,0,0,0])
    const panel = document.getElementById("edit-panel")
    const form = panel.querySelector("form")

    form.textContent = ""
    form.append(createBoardPattern(block))
    panel.showModal()

    panel.getElementsByTagName("button")[0].onclick = e =>{
        const blocks = JSON.parse(localStorage.getItem("blocks"))

        const el = toMultiArray(Array.from(panel.getElementsByTagName("rect"), el => +(el.style["fill"] === "blue")))
        blocks[id] = el

        localStorage.setItem("blocks", JSON.stringify(blocks))
        addBlocks()
    }

}
document.getElementById("custom-blocks").onclick = e => document.getElementById("change-blocks").showModal()

function addBlocks(){
    const blocks = JSON.parse(localStorage.getItem("blocks"))
    const content = document.getElementById("blocks-content")

    content.textContent = ""
    for(let i=0; i<10; i++){
        const tab = blocks[i] || new Array(4).fill(new Array(4).fill(0))

        if(tab.map(el => el.reduce((pre, curr) => pre += curr)).reduce((pre, curr) => pre += curr))
            content.append(createBoardPattern(tab, i))
        else{
            const div = document.createElement("div")
            div.classList.add("add-block")
            div.innerHTML = "<svg class='empty'></svg><span>✎</span><span>&#10008;</span>"
            div.getElementsByTagName("svg")[0].onclick = e => showEditPanel(i)
            content.append(div)
        }
    }
}
addBlocks()