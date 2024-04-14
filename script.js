const canvas = document.getElementById("canvas")
const ctx = canvas.getContext('2d', {willReadFrequently: true})

canvas.width = window.innerWidth
canvas.height = window.innerHeight

ctx.fillStyle = 'lightblue'
ctx.shadowColor = 'lightblue'
ctx.shadowBlur = 4
ctx.strokeStyle = 'lightblue'
ctx.lineWidth = 2

window.addEventListener('resize', function(){
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    ctx.fillStyle = 'lightblue'
    ctx.shadowColor = 'lightblue'
    ctx.shadowBlur = 4
    ctx.strokeStyle = 'lightblue'
    ctx.lineWidth = 2
})

let mousePos = {x: 0, y: 0}
window.addEventListener('mousemove', (event) => {
    mousePos = {x: event.clientX, y: event.clientY}
})

function toCartesian(r, angle){
    let a = r * Math.cos(angle)
    let b = r * Math.sin(angle)
    return {a: a, b: b}
}

let tetra = {
    vertexLayers: [
        {depression: Math.PI / 2 - Math.PI ** 2 / 16, ammount: 2, offset: 0},
        {depression: 3 * Math.PI / 2 - Math.PI ** 2 / 16, ammount: 2, offset: Math.PI / 2}
    ],
    edges: [
        {a: 0, b: 1}, {a: 0, b: 2}, {a: 0, b: 3}, {a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 1}
    ]
}
let hexa = {
    vertexLayers: [ 
        {depression: Math.PI / 2 - Math.PI ** 2 / 16, ammount: 4, offset: 0},
        {depression: 3 * Math.PI / 2 - Math.PI ** 2 / 16, ammount: 4, offset: 0}
    ],
    edges: [
        {a: 0, b: 1}, {a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 0}, {a: 4, b: 5}, {a: 5, b: 6},
        {a: 6, b: 7}, {a: 7, b: 4}, {a: 4, b: 0}, {a: 5, b: 1}, {a: 6, b: 2}, {a: 7, b: 3}
    ] 
}
let octa = {
    vertexLayers: [
        {depression: 0, ammount: 1, offset: 0},
        {depression: Math.PI / 2, ammount: 4, offset: 0},
        {depression: Math.PI, ammount: 1, offset: 0}
    ],
    edges: [
        {a: 0, b: 1}, {a: 0, b: 2}, {a: 0, b: 3}, {a: 0, b: 4}, {a: 5, b: 1}, {a: 5, b: 2},
        {a: 5, b: 3}, {a: 5, b: 4}, {a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 4}, {a: 4, b: 1}
    ] 
}
let dode = {
    vertexLayers: [
        {depression: Math.PI / 2 - Math.atan((3 + Math.sqrt(5)) / 4), ammount: 5, offset: 0},
        {depression: Math.PI / 2 - Math.atan((3 - Math.sqrt(5)) / 4), ammount: 5, offset: 0},
        {depression: Math.PI / 2 + Math.atan((3 - Math.sqrt(5)) / 4), ammount: 5, offset: Math.PI / 5},
        {depression: Math.PI / 2 + Math.atan((3 + Math.sqrt(5)) / 4), ammount: 5, offset: Math.PI / 5}
    ],
    edges: [
        {a: 0, b: 1}, {a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 4}, {a: 4, b: 0}, {a: 0, b: 5},
        {a: 1, b: 6}, {a: 2, b: 7}, {a: 3, b: 8}, {a: 4, b: 9}, {a: 5, b: 10}, {a: 10, b: 6}, 
        {a: 6, b: 11}, {a: 11, b: 7}, {a: 7, b: 12}, {a: 12, b: 8}, {a: 8, b: 13}, {a: 13, b: 9},
        {a: 9, b: 14}, {a: 14, b: 5}, {a: 10, b: 15}, {a: 11, b: 16}, {a: 12, b: 17}, {a: 13, b: 18},
        {a: 14, b: 19}, {a: 15, b: 16}, {a: 16, b: 17}, {a: 17, b: 18}, {a: 18, b: 19}, {a: 19, b: 15},
    ] 
}
let ico = {
    vertexLayers: [
        {depression: 0, ammount: 1, offset: 0},
        {depression: Math.PI / 2 - Math.atan(1/2), ammount: 5, offset: 0},
        {depression: Math.PI / 2 + Math.atan(1/2), ammount: 5, offset: Math.PI / 5},
        {depression: Math.PI, ammount: 1, offset: Math.PI / 5}
    ],
    edges: [
        {a: 0, b: 1}, {a: 0, b: 2}, {a: 0, b: 3}, {a: 0, b: 4}, {a: 0, b: 5}, {a: 1, b: 2},
        {a: 2, b: 3}, {a: 3, b: 4}, {a: 4, b: 5}, {a: 5, b: 1}, {a: 1, b: 6}, {a: 6, b: 2}, 
        {a: 2, b: 7}, {a: 7, b: 3}, {a: 3, b: 8}, {a: 8, b: 4}, {a: 4, b: 9}, {a: 9, b: 5},
        {a: 5, b: 10}, {a: 10, b: 1}, {a: 6, b: 7}, {a: 7, b: 8}, {a: 8, b: 9}, {a: 9, b: 10},
        {a: 10, b: 6}, {a: 6, b: 11}, {a: 7, b: 11}, {a: 8, b: 11}, {a: 9, b: 11}, {a: 10, b: 11}, 
    ] 
}

class Polyhedron {
    constructor (model){
        this.vertices = this.vertexUnpacker(model)
        this.edges = model.edges
        this.clock = 0
    }
    vertexUnpacker (model){
        let vertices = []
        for (let layer of model.vertexLayers){
            let angleStep = 2 * Math.PI / layer.ammount
            for (let i = 0; i < layer.ammount; i++){
                let y = Math.cos(layer.depression)
                let rotation = angleStep * i
                vertices.push({x: 0, y: y, z: 0, rotation: rotation + layer.offset, drawX: 0, drawY: 0})
            }
        }
        return vertices
    }
    animate (dt){
        this.clock += dt
        for (let vertex of this.vertices){
            let XZ = toCartesian(Math.sqrt(1 - vertex.y ** 2), vertex.rotation + this.clock)
            vertex.x = XZ.a
            vertex.z = XZ.b
        }
    }
    display (offset){
        for (let vertex of this.vertices){
            vertex.drawX = canvas.height * (vertex.x) / (2 + vertex.z + offset / 600) + canvas.width / 2
            vertex.drawY = canvas.height * (vertex.y - .2 * Math.sin(this.clock)) / (2 + vertex.z + offset / 600) + canvas.height / 2
            //ctx.beginPath()
            //ctx.arc(vertex.drawX, vertex.drawY, 1, 0, 2 * Math.PI)
            //ctx.fill()
        }
        for (let edge of this.edges){
            let startX = this.vertices[edge.a].drawX
            let startY = this.vertices[edge.a].drawY
            let endX = this.vertices[edge.b].drawX
            let endY = this.vertices[edge.b].drawY

            ctx.beginPath()
            ctx.moveTo(startX, startY)
            ctx.lineTo(endX, endY)
            ctx.stroke()
        }
    }
}

let polyhedra = [
    new Polyhedron(tetra), new Polyhedron(hexa), new Polyhedron(octa), 
    new Polyhedron(dode), new Polyhedron(ico)
]

let dt
let msPrev = window.performance.now()
let offset
let msNow

function main (){
    requestAnimationFrame(main)
	msNow = window.performance.now()
	dt = (msNow - msPrev) * .001

    offset = mousePos.y / canvas.height * 10000

    for (let polyhedron of polyhedra){
        polyhedron.animate(dt)
    }

	ctx.clearRect(0, 0, canvas.width, canvas.height);

    polyhedra[Math.floor(mousePos.x / canvas.width * 5)].display(offset)

	msPrev = msNow
}

main()
