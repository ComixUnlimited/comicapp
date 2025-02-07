import axios from 'axios';
import infoScraper from './infoScraper';
const { URL } = require('./endpoints');
const cheerio = require('cheerio');

export const getComicsThroughSearch = (query, page = 1) => {
  console.log(`Fetching comics for page ${page}...`);  // Log the page being fetched

  return new Promise((resolve, reject) => {
    const search = query.trim().split(" ").join('+');

    axios(`${URL.searchUri1}/${page}/${URL.searchUri2}${search}`).then(
      response => {
        const $ = cheerio.load(response.data);

        const comics = [];

        const error = $('.pagination-button').text();
        if (error === "No Result: Please try another search query.") {
          reject("No results available for your search query");
        }

        // Loop through the articles to scrape comic data
        $('article').each(function () {
          let coverPage = $(this).find('img').attr('src');
          let valid = $(this).find('.post-info').children().remove().end().text();
          let href = $(this).find('a').attr('href');

          if (valid) {
            const promise = new Promise((resolve, reject) => {
              // Strip the "https://getcomics.org" base URL from the href
              const targetUrl = href.replace('https://getcomics.org', '');

              // Route through the proxy server with the modified href
              axios(`https://comicapp-rho.vercel.app/comics${targetUrl}`).then(response => {
                const $ = cheerio.load(response.data);

                const title = $('.post-info').find('h1').text().trim();
                const description = $('.post-contents').find('p').first().children().remove().end().text().trim();
                const scrapedInfo = $('.post-contents > p:nth-child(7)').text().split("|").splice(1, 3).join().toString();

                let downloadLinks = {};
                $('.aio-pulse').each(function () {
                  const scrapedDownloadTitle = $(this).children('a').attr('title').split(' ').join('');
                  const scrapedDownloadLinks = $(this).children('a').attr('href');
                  downloadLinks[scrapedDownloadTitle] = scrapedDownloadLinks;
                });

                const information = infoScraper(scrapedInfo);

                const comic = {
                  title, description, coverPage, information, downloadLinks
                };
                resolve(comic);
              }).catch(err => {
                console.error(`Error fetching comic data from ${href}: `, err);
                reject(err);
              });
            });
            comics.push(promise);
          }
        });

        // Log how many comics were found for this page
        console.log(`Found ${comics.length} comics on page ${page}`);

        resolve(Promise.all(comics).then(comicsData => {
          // Log the comics data for debugging
          console.log(`Comics data fetched for page ${page}:`, comicsData);
          return comicsData;
        }));
      }).catch(err => {
        console.error(`Error fetching page ${page}:`, err);
        reject(err);
      });
  });
};
