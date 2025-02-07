import { load } from 'cheerio';
import axios from 'axios';
import infoScraper from './infoScraper';

export const parentScraper = (uri, page) => {
  return new Promise((resolve, reject) => {
    const targetUrl = `${uri}/${page}`;  // Construct the URL for the page to scrape

    axios(targetUrl)
      .then(response => {
        const $ = load(response.data);
        const comics = [];

        $('article').each(function() {
          let coverPage = $(this).find('img').attr('src');
          let valid = $(this).find('.post-info').children().remove().end().text();
          let href = $(this).find('a').attr('href');

          // If the href is a full URL (https://getcomics.org/...), remove the base part
          if (href.startsWith('https://getcomics.org')) {
            // Remove 'https://getcomics.org' and replace with the proxy URL base
            href = href.replace('https://getcomics.org', 'https://your-vercel-project-name.vercel.app/comics');
          }

          // Only include individual comics, not bundles
          if (valid) {
            const promise = new Promise((resolve, reject) => {
              axios(href)
                .then(response => {
                  const $ = load(response.data);

                  const title = $('.post-info').find('h1').text().trim();
                  const description = $('.post-contents').find('p').first().children().remove().end().text().trim();
                  const scrapedInfo = $('.post-contents > p:nth-child(7)').text().split("|").splice(1, 3).join().toString();

                  let downloadLinks = {};
                  $('.aio-pulse').each(function() {
                    const scrapedDownloadTitle = $(this).children('a').attr('title').split(' ').join('').toLocaleUpperCase();
                    const scrapedDownloadLinks = $(this).children('a').attr('href');
                    downloadLinks[scrapedDownloadTitle] = scrapedDownloadLinks;
                  });

                  const information = infoScraper(scrapedInfo);

                  const comic = {
                    title,
                    coverPage,
                    description,
                    information,
                    downloadLinks,
                  };

                  resolve(comic);
                })
                .catch(err => {
                  reject(err);
                });
            });

            comics.push(promise);
          }
        });

        resolve(Promise.all(comics));
      })
      .catch(err => {
        reject(err);
      });
  });
};
