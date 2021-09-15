const N = 9
let R = document.getElementsByClassName("range")[0].value
const SIZE = 2 ** N

const TL_height = 0
const TR_height = 0
const BL_height = 0
const BR_height = 1

const PX_SIZE = 1
const MIN = 0
const MAX = 2

let matrix = []

for (let i = 0; i <= SIZE; i++) {
    matrix[i] = []
}

document.getElementById("generate-button").addEventListener("click", generate)
document.getElementsByClassName("range")[0].addEventListener("input", rangeChange)
generate()

//FUNCTIONS

function rangeChange() {
    rangeValue = document.getElementsByClassName("range")[0].value
    document.getElementsByClassName('range-label')[0].innerHTML = rangeValue
    R = rangeValue
}

function generate() {
    
    matrix[0][0] = TL_height
    matrix[0][SIZE] = TR_height
    matrix[SIZE][0] = BL_height
    matrix[SIZE][SIZE] = BR_height

    algoritm()
    draw()
}

function draw() {

    let canvas = document.getElementsByClassName("canvas")[0]
    let ctx = canvas.getContext("2d")

    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {

            ctx.fillStyle = getGrayColor(j, i)
            ctx.fillRect(i * PX_SIZE, j * PX_SIZE, PX_SIZE, PX_SIZE);

            ctx.fillStyle = getRGBColor(j, i, 'physical')
            ctx.fillRect(550 + i * PX_SIZE, j * PX_SIZE, PX_SIZE, PX_SIZE);
        }
    }
}

function getGrayColor(x, y) {
    
    const color = Math.trunc(matrix[x][y] * 255 / 1)
    return `rgb(${color},${color},${color})`
}

function getRGBColor(x, y) {

    if (matrix[x][y] < 0.02) {
        return '#2462c7'
    }
    else if (matrix[x][y] < 0.1) {
        return '#207bbd'
    }
    else if (matrix[x][y] < 0.2) {
        return '#99ba7d'
    }
    else if (matrix[x][y] < 0.6) {
        return '#6ca665'
    }
    else if (matrix[x][y] < 0.8) {
        return '#738067'
    }
    else {
        return '#cccccc'
    }
}

function algoritm() {

    let size = SIZE
    for (let i = 1; i <= N; i++) {

        diamond(i, size)
        square(i, size)
        size /= 2;
    }
}

function diamond(iter, size) {

    for (let y = 0; y < SIZE; y += size) {
        for (let x = 0; x < SIZE; x += size) {

            const half = size/2

            const average_height = (matrix[x][y] + matrix[x + size][y] + matrix[x][y + size] + matrix[x + size][y + size]) / 4
            const ri = R ** iter;
            const random_height = ri * 2 * Math.random() - ri

            matrix[x + half][y + half] = average_height + random_height
        }
    }
}

function square(iter, size) {
    
    const half = size/2
    //even
    for (let y = 0; y <= SIZE; y += size) {
        for (let x = half; x <= SIZE; x += size) {
            squareCount(x, y, iter, half)
        }
    }

    //odd
    for (let y = half; y <= SIZE; y += size) {
        for (let x = 0; x <= SIZE; x += size) { 
            squareCount(x, y, iter, half)
        }
    }
}

function squareCount(x, y, iter, half) { 

    let average_height = 0
    if (x - half >= 0) {
        average_height += matrix[x - half][y]
    }
    if (x + half <= SIZE) {
        average_height += matrix[x + half][y]
    }
    if (y - half >= 0) {
        average_height += matrix[x][y - half]
    }
    if (y + half <= SIZE) {
        average_height += matrix[x][y + half]
    }
    average_height /= 4
    const ri = R ** iter;
    const random_height = ri * 2 * Math.random() - ri
    matrix[x][y] = average_height + random_height
}