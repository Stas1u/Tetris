if(!sessionStorage.getItem("patterns")){
    const builded = [[[0,1,0,0],[1,1,1,0],[0,1,0,0],[0,0,0,0]],[[0,1,1,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]],[[0,0,1,0],[0,0,1,0],[0,1,1,0],[0,1, 1,0]],[[1,1,1,0],[1,1,1,0],[1,1,1,0],[0,0,0,0]]]
    const patterns = !localStorage.getItem("ExtraBlocks")? JSON.stringify(builded): JSON.stringify(builded.concat(JSON.parse(localStorage.getItem("ExtraBlocks"))))
    sessionStorage.setItem("patterns", patterns)
}
// class Patterns{
//     get patterns(){
//         return JSON.parse(sessionStorage("patterns"))
//     }
//     set patterns(val){
//         sessionStorage.setItem("patterns", JSON.stringify(val))
//     }
//     add(pattern){
//         this.patterns = this.patterns.concat([pattern])
//     }
//     remove(index){
//         const {patterns} = this
//         patterns.splice(index, 1)
//         this.patterns = patterns
//     }
// }
const toMultiArray = arr =>{
    const iter = arr[Symbol.iterator]()
    const pattern = [[], [], [], []]

    for(let i=0; i<16; i++)
        pattern[Math.floor(i/4)].push(iter.next().value)

    return pattern
}

function createBoardPattern(arr, size, toShow=true, byUser=false){
    const pattern = document.createElement("div");
    if(toShow){
		const span = document.createElement("span")
		span.classList.add("edit")
		span.innerHTML = "✎"
		span.setAttribute("onclick", "showEditingPanel(this)")
		
		pattern.append(span)
        pattern.classList.add("pattern")
	}
    if(byUser)
        pattern.setAttribute("byUser","")
    
    let svg =  `<svg width="${size*16}" height="${size*16}" viewBox="0 0 38.5 38.5">`
    for(const [y, subArr] of arr.entries())
        for(const [x, el] of subArr.entries())
            svg += `<rect style="fill:${el? "blue": "transparent"};stroke:white;stroke-width:0.5" width="9.5" height="9.5" x="${x*9.5}" y="${y*9.5}" />`
    pattern.innerHTML += svg + "</svg>"

    return pattern
}
function showEditingPanel(edit){
    const panelContent = document.getElementById("panel-content")
    const [cBtn, delBtn] = document.querySelector("dialog").getElementsByTagName("button")

    const pattern = toMultiArray(Array.from(edit?.closest(".pattern")?.getElementsByTagName("rect") || [], el => el.style["fill"] === "transparent"? 0: 1))
    panelContent.textContent = ""
    panelContent.append(createBoardPattern(pattern, 20, false))

    panelContent.onclick = e => {e.target.style["fill"] = e.target.style["fill"]==="transparent"? "blue": "transparent"}

    const EditIndex = JSON.parse(sessionStorage.getItem("patterns")).findIndex(el => JSON.stringify(el) === JSON.stringify(pattern))
    cBtn.setAttribute("edit", EditIndex !== -1? EditIndex: "")

    delBtn.textContent = edit? "Delete": "Canel"
    if(edit) 
        delBtn.onclick = e => deletePattern(EditIndex)

    document.getElementById("panel").showModal()
}
function deletePattern(i){
    const session = JSON.parse(sessionStorage.getItem("patterns"))
    session.splice(i, 1)
    sessionStorage.setItem("patterns", JSON.stringify(session))

    const extra = JSON.parse(localStorage.getItem("ExtraBlocks"))
    extra.splice(+i-4, 1)
    localStorage.setItem("ExtraBlocks", JSON.stringify(extra))

    writeExtraBlocks()
}




function writeExtraBlocks(){
    const patterns = JSON.parse(sessionStorage.getItem("patterns"))
    const block = document.getElementById("extra-blocks")

    block.textContent = ""
    for(const pattern of patterns)
        block.append(createBoardPattern(pattern, 3))
    block.innerHTML += `<button id="add-pattern">+</button>`

    document.querySelectorAll("#extra-blocks .pattern:nth-of-type(n+5)")?.forEach(pattern => pattern.setAttribute("byUser", ""))

    document.getElementById("add-pattern").onclick = e => showEditingPanel()

    Array.from(document.getElementsByClassName("pattern")).forEach(pattern => pattern.onclick = e => e.target.innerHTML !== "✎" && pattern.toggleAttribute("clicked"))
}

writeExtraBlocks()



document.getElementById("panel-confirm").onclick = e =>{
    const pattern = toMultiArray(Array.from(document.getElementById("panel-content").getElementsByTagName("rect"), el => el.style["fill"]==="transparent"? 0 :1))
    const session = JSON.parse(sessionStorage.getItem("patterns"))
    const edit = e.target.getAttribute("edit")

    const patterns = edit? (session[edit] = pattern, session): session.concat([pattern])

    sessionStorage.setItem("patterns", JSON.stringify(patterns))

    writeExtraBlocks()

    if(!localStorage.getItem("ExtraBlocks"))
        localStorage.setItem("ExtraBlocks", JSON.stringify([pattern]))
    else{
        const patterns = JSON.parse(localStorage.getItem("ExtraBlocks"))
        if(edit)
            patterns[+edit - 4]
        else
            patterns.push(pattern)
        localStorage.setItem("ExtraBlocks", JSON.stringify(patterns))
    }
}