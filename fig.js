const arrayChange = arr =>{
    arr = arr.filter(el => el.reduce((pre, curr) => pre+=curr) > 0)
    arr = new Array(arr[0].length).fill(new Array(arr.length).fill(0)).map((subEl,i) => subEl.map((x,j) => arr[j][i] || 0)).reverse()
    arr = arr.filter(el => el.reduce((pre, curr) => pre+=curr) > 0)
    return arr
} 

const figures = JSON.parse(localStorage.getItem("blocks")).filter(el => el).map(el => arrayChange(el))

export class Figure{
    __proto__ = null
    figures = figures
    constructor() {
        return {value: this.figures[Math.floor(Math.random() * figures.length)], shiftI:0, shiftJ:4}
    }
    static rotate = (current, type) => {
        const {value: el} = current
        const tab = new Array(el[0].length).fill(new Array(el.length).fill(0)).map((subEl,i) => subEl.map((x,j) => el[j][i] || 0)).reverse()

        current.value = type === "left"? tab: tab.map(el => el.reverse()).reverse()
        return current
    }
}