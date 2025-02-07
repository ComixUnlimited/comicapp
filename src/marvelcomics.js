const { Marvel } = require('./endpoints');
const {parentScraper} = require('./parentScraper')

exports.getMarvelComics = async (page) => {
    const uri = fixCorsErrors(Marvel.marvelHome)
    return await parentScraper(uri,page)
};