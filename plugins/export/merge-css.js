const {
	readFile,
	outputFile,
} = require(`fs-extra`)
const CleanCss = require(`clean-css`)
const path = require(`path`)

module.exports = async (config) => {

	const cachedPath = path.join(`./.cache/google-fonts/`, config.pathPrefix)

	// Read files
	const [ woff2, woff ] = await Promise.all([
		readFile(`${cachedPath}/woff2.css`, `utf8`),
		readFile(`${cachedPath}/woff.css`, `utf8`),
	])

	const woff2Lines = getLines(woff2)
	const woffLines = getLines(woff)
	mergeLines(woff2Lines, woffLines)

	let css = createCssString(woff2, woff2Lines)
	css = new CleanCss().minify(css).styles
	await outputFile(`${cachedPath}/google-fonts.css`, css)
}

function getLines(data) {
	const lines = {}
	data.split(`\n`).forEach(line => {
		line = line.trim()
		if (line.indexOf(`src:`) === 0) {
			let items = line
				.replace(`;`, ``)
				.replace(`src:`, ``)
				.split(`,`)
				.map(item => item.trim())
			let name = items.shift()
			lines[name] = {
				items,
				line: line.replace(`;`, ``),
			}
		}
	})
	return lines
}

function mergeLines(origin, newLines){
	for(let i in origin){
		if(newLines[i]){
			origin[i].newLine = `${origin[i].newLine || origin[i].line}, ${newLines[i].items[newLines[i].items.length - 1]}`
		}
	}
}

function createCssString(str, obj){
	for(let i in obj){
		str = str.replace(obj[i].line, obj[i].newLine)
	}
	return str
}
