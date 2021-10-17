let N
let R
let SIZE
let matrix

const TL_height = -0.1
const TR_height = -0.1
const BL_height = -0.1
const BR_height = -0.1

const CANVAS_SIZE = 512
const MIN = 0
const MAX = 2

//FUNCTIONS

function rangeUpdate() {
    rangeValue = document.getElementById("range").value
    document.getElementById('range-label').innerHTML = rangeValue
}

function newMap() {

    map = new Map()
    gen = new Generator(map)
    painter = new Painter(map)

    gen.generate()
    painter.draw()
}

//CLASSES

class Map {

    constructor() {

        this.N = parseInt(document.getElementById("size").value)
        this.SIZE = 2 ** this.N
        this.m = []
        for (let i = 0; i <= this.SIZE; i++) {
            this.m[i] = []
        }
        this.m[0][0] = TL_height
        this.m[0][this.SIZE] = TR_height
        this.m[this.SIZE][0] = BL_height
        this.m[this.SIZE][this.SIZE] = BR_height
    }
}

class Generator {

    constructor(_map) {
        this.map = _map

        this.x = 0
        this.y = 0
        this.n = this.map.N
        this.size = this.map.SIZE
        this.r = document.getElementById("range").value
    }

    setParameters(_x, _y, _n) {
        this.x = _x
        this.y = _y
        this.n = _n
        this.size = 2 ** _n
        this.r = document.getElementById("range").value
    }

    generate() {

        let step = this.size
        let iter = 1 + this.map.N - this.n
    
        while (step > 1) {
            this.diamond(step, iter)
            this.square(step, iter)
            step /= 2;
            iter++
        }
    }

    diamond(step, iter) {
        
        for (let y = this.y; y < this.y + this.size; y += step) {
            for (let x = this.x; x < this.x + this.size; x += step) {

                const half = step / 2
                let average_height = 0

                average_height += this.map.m[x][y]
                average_height += this.map.m[x + step][y]
                average_height += this.map.m[x][y + step]
                average_height += this.map.m[x + step][y + step]
                average_height /= 4
                
                const ri = this.r ** iter;
                const random_height = ri * 2 * Math.random() - ri

                this.map.m[x + half][y + half] = average_height + random_height
            }
        }
    }

    square(step, iter) {

        const half = step / 2

        //first_generation
        if (this.x == 0 && this.y == 0 && this.size == this.map.SIZE) {
    
            for (let x = half; x < this.size; x += step) {
                this.squareInput(x, 0, iter, half)
                this.squareInput(x, this.size, iter, half)
            }
            for (let y = half; y < this.size; y += step) {
                this.squareInput(0, y, iter, half)
                this.squareInput(this.size, y, iter, half)
            }
        }
        
        //even
        for (let y = this.y + step; y <= this.y + this.size - step; y += step) {
            for (let x = this.x + half; x <= this.x + this.size; x += step) {
                this.squareInput(x, y, iter, half)
            }
        }
    
        //odd
        for (let x = this.x + step; x <= this.x + this.size - step; x += step) {
            for (let y = this.y + half; y <= this.y + this.size; y += step) {
                this.squareInput(x, y, iter, half)
            }
        }
    }

    squareInput(x, y, iter, half) {

        let average_height = 0
        let div = 0
    
        if (x - half >= 0) {
            average_height += this.map.m[x - half][y]
            div += 1
        }
        if (x + half <= this.map.SIZE) {
            average_height += this.map.m[x + half][y]
            div += 1
        }
        if (y - half >= 0) {
            average_height += this.map.m[x][y - half]
            div += 1
        }
        if (y + half <= this.map.SIZE) {
            average_height += this.map.m[x][y + half]
            div += 1
        }

        average_height /= div
        const ri = this.r ** iter;
        const random_height = ri * 2 * Math.random() - ri
        this.map.m[x][y] = average_height + random_height

    }
}

class Painter {
    
    constructor(_map) {

        this.canvasGray = document.getElementById("canvas-gray")
        this.canvasRGB = document.getElementById("canvas-rgb")
        this.canvasFull = document.createElement("canvas")
        this.map = _map
        this.canvasFull.width = this.map.SIZE + 1
        this.canvasFull.height = this.map.SIZE + 1
        this.canvasSize = CANVAS_SIZE
        }

    draw() {

        const ctxGray = this.canvasGray.getContext("2d")
        const ctxRGB = this.canvasRGB.getContext("2d")
        const ctxFull = this.canvasFull.getContext("2d")

        const scaling = this.canvasSize / this.map.SIZE

        ctxGray.clearRect(0, 0, this.map.SIZE, this.map.SIZE)
        ctxRGB.clearRect(0, 0, this.map.SIZE, this.map.SIZE)

        for (let j = 0; j < this.map.SIZE; j++) {
            for (let i = 0; i < this.map.SIZE; i++) {

                // FULL SIZE            
                ctxFull.fillStyle = this.getGrayColor(i, j)
                ctxFull.fillRect(i, j, 1, 1)

                // GRAY SMALL
                ctxGray.fillStyle = ctxFull.fillStyle
                ctxGray.fillRect(i * scaling, j * scaling, scaling, scaling)

                // RGB SMALL
                ctxRGB.fillStyle = this.getRGBColor(i, j)
                ctxRGB.fillRect(i * scaling, j * scaling, scaling, scaling)

            }
        }
        document.getElementById("download-button").href = this.canvasFull.toDataURL()

        ctxGray.drawImage(this.canvasFull, 0, 0, this.canvasSize, this.canvasSize)
    }

    getGrayColor(x, y) {
        const color = Math.trunc((0.5 + this.map.m[x][y]) * 255 / 1)
        return `rgb(${color},${color},${color})`
    }

    getRGBColor(x, y) {

        if (map.m[x][y] < 0) {
            const color = Math.trunc((0.5 + this.map.m[x][y]) * 255 / 1.5)
            return `rgb(${color - 20},${color - 20},${60 + color})`
        }
        else {
            const color = Math.trunc((0.5 + this.map.m[x][y]) * 255 / 1.5)
            return `rgb(${color + 40},${60 + color},${color - 20})`
        }
    }

}

// START

let map
let gen
let painter

newMap()

document.getElementById("generate-button").addEventListener("click", newMap)
document.getElementById("range").addEventListener("input", rangeUpdate)