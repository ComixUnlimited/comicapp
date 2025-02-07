//get info for latest comics from home page

const { URL } = require('./endpoints');
const { parentScraper } = require('./parentScraper');

exports.getLatestComics = async (page) => {
    const uri = URL.base;
    return await parentScraper(uri, page);
};