const fs = require('fs')
const path = require('path')
const mimeType = require('mime-types')
const sizeOf = require('image-size')

const themePath = path.resolve(__dirname, '../static/counters')
const themeList = {}

fs.readdirSync(themePath).forEach(theme => {
    if(!(theme in themeList)) themeList[theme] = {}
    let imgList = fs.readdirSync(path.resolve(themePath, theme))
    imgList.forEach(img => {
        let imgPath = path.resolve(themePath, theme, img)
        let name = path.parse(img).name
        let { width, height } = sizeOf(imgPath)

        themeList[theme][name] = {
            width,
            height,
            data: convertToDataURI(imgPath)
        }
    })
})

function convertToDataURI(path){
    let mime = mimeType.lookup(path)
    let base64 = fs.readFileSync(path).toString('base64')

    return `data:${mime};base64,${base64}`
}

function getCountImage({ count, theme='moebooru', length=7 }) {
    if(!(theme in themeList)) theme = 'moebooru'

    // This is not the greatest way for generating an SVG but it'll do for now
    let countArray = count.toString().padStart(length, '0').split('')

    let x = 0, y = 0
    let parts = countArray.reduce((acc, next, index) => {
        let { width, height, data } = themeList[theme][next]

        let image = `${acc}
        <image x="${x}" y="0" width="${width}" height="${height}" xlink:href="${data}" />`

        x += width

        if(height > y) y = height

        return image
    }, '')

    return `<?xml version="1.0" encoding="UTF-8"?>
        <svg width="${x}" height="${y}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="image-rendering: pixelated;">
            <title>Moe Counter</title>
            <g>
                ${parts}
            </g>
        </svg>
    `
}

module.exports = { getCountImage }
