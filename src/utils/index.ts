import { JSDOM } from 'jsdom';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import Adblocker from 'puppeteer-extra-plugin-adblocker';
export const getElement = async (
  page: Page,
  selector: string,
): Promise<Document> => {
  const tableElement = await page.$eval(selector, (el) => el.outerHTML);
  const tableDOM = new JSDOM(tableElement);
  const { document } = tableDOM.window;
  return document;
};

export const initialBrowser = async () => {
  puppeteer.use(Adblocker({ blockTrackers: true }));
  const browser = await puppeteer.launch({
    headless: true,
    // args: ["--no-sandbox"],
  });
  return browser;
};

export const closeBrowser = async ({ browser }: { browser: Browser }) => {
  await browser.close();
};
