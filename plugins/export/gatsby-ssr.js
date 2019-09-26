const React = require(`react`)
const globby = require(`globby`).sync
const { readFileSync } = require(`fs`)
const path = require(`path`)

function checkFontProperty(file, fonts, property){

	// Get all the font objects that have this property.
	// We are looking for "includePaths" or "excludePaths".
	const fontObjs = fonts.filter(font => font[property])

	// Get the matching font for the file trying to be added
	const matchedFont =  fontObjs && fontObjs.find(font => file.includes(font.family.toLowerCase().replace(/\s/g,``)))

	if (matchedFont){
		return matchedFont[property]
	}
	return false
}

function getPathsWithExcludeAllOtherFonts(fonts){
	// Get an array of fonts that have includePaths and excludeAllOtherFonts
	return fonts.flatMap(font => { 
		if (!font.includePaths){
			return
		}
		if (font.excludeAllOtherFonts) {
			return font.includePaths
		}
	
	}).filter(font => typeof font !== `undefined`)
}


exports.onRenderBody = ({ pathPrefix = ``, setHeadComponents, pathname }, {fonts = []}) => {
	const files = globby(`./public/google-fonts/**/*.woff2`)	
	const css = readFileSync(path.join(`./.cache/google-fonts/`, pathPrefix, `google-fonts.css`))
	setHeadComponents([
		...files.map((file, key) => {

			const linkTag = <link
				key={`googleFont${key}`}
				rel='preload'
				as='font'
				type='font/woff2'
				crossOrigin='anonymous'
				href={file.replace(`./public`, pathPrefix)}
			/>
			
			// Make sure this font is not exluded on this path
			if (checkFontProperty(file, fonts, `excludePaths`) 
				&& checkFontProperty(file, fonts, `excludePaths`).includes(pathname)
			){
				return
			}
		
			// Check whether the font should be included on a specific path only
			// and that path is this one
			if (checkFontProperty(file, fonts, `includePaths`)){
				if (checkFontProperty(file, fonts, `includePaths`).includes(pathname)){
					return linkTag
				}  else {
					return
				}
			}

			// Add it globally
			// if the current font doesn't have an includePaths or excludePaths rule
			// and if the current path does have an include rule but it's not unique to that path
			if (!getPathsWithExcludeAllOtherFonts(fonts).includes(pathname) ){
				return linkTag
			}

		}),
		<style
			key='googleFontsCSS'
			type='text/css'
			dangerouslySetInnerHTML={{__html: css}}
		/>,
	])
}