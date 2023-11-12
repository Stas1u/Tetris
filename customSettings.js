document.querySelectorAll("#mods .checkbox").forEach(el => el.onclick = e => el.toggleAttribute("checked"))
document.querySelectorAll("#mods .sBtn").forEach(el => el.onclick = e => {
    el.parentElement.querySelector(".switch").toggleAttribute("clicked")
    el.toggleAttribute("clicked")
})

const drawN = numericTab =>{
    for(const [i, nTab] of Array.from(numericTab.getElementsByClassName("nTab")).entries()){
        const value = +nTab.getAttribute("value")
        const blocked = [false, false]
        if(value === 0){
            blocked[1] = true
        }
        if(i === 0 && value === +nTab.getAttribute("max"))
            blocked[0] = true
        nTab.innerHTML = `
            
            <span>${value}</span>
            <div class="nBtn" up blocked="${blocked[0]}"></div>
            <div class="nBtn" down blocked="${blocked[1]}"></div>`
    }
}

for(const numericTab of Array.from(document.getElementsByClassName("numericTab")))
    for(const [i, nTab] of Array.from(numericTab.getElementsByClassName("nTab")).entries()){
        drawN(numericTab)
        nTab.onclick = e =>{
            if((!e.target.hasAttribute("up") && !e.target.hasAttribute("down")) || e.target.getAttribute("blocked") === "true")
                return 0
            
            let n = i
            let target = e.currentTarget
            const shift = e.target.hasAttribute("up")? 1: -1

            while(target){
                const value = +target.getAttribute("value") + shift
                const max = +target.getAttribute("max")

                if(value <= max){
                    // if(value === 0 && shift === -1){
                    //     console.log(e.target)
                    //     e.target.setAttribute("blocked", true)
                    // }
                    // else
                    //     e.target.setAttribute("blocked", false)
                    target.setAttribute("value", value)
                    break
                }         
                else
                    target.setAttribute("value", 0)      
                n--
                target = Array.from(numericTab.getElementsByClassName("nTab"))[n]
            }
            
            drawN(numericTab)
        }
    }

