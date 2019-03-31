import * as Crawler from 'crawler';

export default class BaseCrawler {
  fetch() {
    let c = new Crawler({
      maxConnections: 10,
      callback: (error, res, done) => {
        if (error) {
          console.log(error);
        } else {
          let $ = res.$;
          // $ is Cheerio by default
          $('.dribbble-over').map((index, item)=> console.log(item.href, index));
        }
        done();
      },
    });

    // Queue just one URL, with default callback
    c.queue('https://dribbble.com/shots');
  }
}

new BaseCrawler().fetch();
