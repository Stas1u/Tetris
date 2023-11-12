// const sKeys = ['Volume','MusicNumber','Speed','Left','Right','RotateLeft','RotateRight','HardDrop']
const getKeys = () => Array.from(document.querySelectorAll("#controls input"), el => el.value === "SPACE"? " ": el.value)

const setSession = () =>{
    const indexes = Array.from(document.querySelectorAll("#extra-blocks .pattern"), el => el.getAttribute("clicked") === ""? 1: 0)
    const data = {
        keys: getKeys(),
        gameSpeed: document.querySelector("#game input").value,
        ExtraBlocks: indexes
    }
    sessionStorage.setItem("settings", JSON.stringify(data))
}


const settings = sessionStorage.getItem("settings")
if(settings){
    const indexes = JSON.parse(settings)["ExtraBlocks"]
    document.querySelectorAll("#extra-blocks .pattern").forEach((el, i) => {if(indexes[i])el.setAttribute("clicked","")})

    const keys = JSON.parse(settings)["keys"]
    document.querySelectorAll("#controls input").forEach((el,i) => el.value = keys[i] === " "? "SPACE": keys[i])
    
    document.querySelector("#game input").value = JSON.parse(settings)["gameSpeed"]
}
// document.querySelectorAll("input, select").forEach((el,i) => el.value = sessionStorage.getItem(sKeys[i]) || el.value)




document.body.onkeydown = e =>{
    const focus = document.querySelector("input[type=text]:focus")
    if(focus && !getKeys().includes(e.key.toUpperCase()))
        focus.value = e.key===" "? "SPACE": e.key.toUpperCase()
}

document.getElementById("save").onclick = e =>{
    setSession()
    close()
}