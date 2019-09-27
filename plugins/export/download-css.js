const GoogleFontsPluginOptions = require(`google-fonts-plugin/dist/Options/Options`).default
const GoogleFontsPluginFonts = require(`google-fonts-plugin/dist/Fonts/Fonts`).default
const fs = require(`fs`)
const path = require(`path`)

module.exports = async (options, config) => {
	// override specific options for this plugin
	options.formats = [
		`woff`,
		`woff2`,
	]
	options.encode = false // Triggers font-display property

	const googleFontsPluginOptions = new GoogleFontsPluginOptions(options)
	const outputPath = path.join(`.cache`, `google-fonts`, config.pathPrefix)
	fs.mkdirSync(outputPath, { recursive: true })

	for (const format of Object.values(googleFontsPluginOptions.formats)) {
		const fonts = new GoogleFontsPluginFonts(format, googleFontsPluginOptions)
		let css = await fonts.requestFontsCSS()
		fs.writeFileSync(path.join(outputPath, `${format}.css`), css)
	}
}
