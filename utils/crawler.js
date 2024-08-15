import * as cheerio from "cheerio";
import * as Spider from "node-spider";
import TurndownService from "turndown";
import parse from "url-parse";

const turndownService = new TurndownService();

class Crawler {
  pages = [];
  limit = 1;
  spider = {};
  count = 0;
  textLengthMinimum = 200;
  urls = [];

  constructor(urls, textLengthMinimum = 200) {
    this.urls = urls;
    this.limit = 1;
    this.textLengthMinimum = textLengthMinimum;

    this.count = 0;
    this.pages = [];
    this.spider = {};
  }

  handleRequest = async (doc) => {
    const $ = cheerio.load(doc.res.body);
    $("script").remove();
    $("#header-menu").remove();
    $("header").remove();
    $("img").remove();
    $(".vector-column-start").remove();
    $(".reaction-box").remove();
    $("#horiznav_nav").remove();
    $(".infobox.vcard").remove();
    $(".vector-appearance-pinned-container").remove();
    $(".reflist").remove();
    $("#References").remove();
    $("footer").remove();
    $('.mw-references-wrap.mw-references-columns').remove()
    $('.smw-tabs.smw-factbox').remove()
    $('.tab-content-facts-list').remove()

    const title = $("h1").text();
    const html = $("body").html();
    const text = turndownService.turndown(html);

    const page = {
      url: doc.url,
      text,
      title,
    };


    console.log(page,'PAGE LETS PUSH')
    if (text.length > this.textLengthMinimum) {
      this.pages.push(page);
    }
  };

  start = async () => {
    this.pages = [];
    return new Promise((resolve, reject) => {
      this.spider = new Spider({
        concurrent: 5,
        delay: 0,
        allowDuplicates: false,
        catchErrors: true,
        addReferrer: false,
        xhr: false,
        keepAlive: false,
        error: (err, url) => {
          console.log(err, url);
          reject(err);
        },
        done: () => {
          console.log("done, from spider");
          resolve(this.pages);
        },
        headers: { "user-agent": "node-spider" },
        encoding: "utf8",
      });
      this.urls.forEach((url) => {
        this.spider.queue(url, this.handleRequest);
      });
    });
  };
}

export default Crawler;
