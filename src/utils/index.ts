import { JSDOM } from 'jsdom';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import puppeteerCore from 'puppeteer-core';
import Adblocker from 'puppeteer-extra-plugin-adblocker';
// import chromium from '@sparticuz/chromium';
import chromium from '@sparticuz/chromium-min';

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
  try {
    const config = {
      args: [
        '--hide-scrollbars',
        '--disable-web-security',
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
      ignoreHTTPSErrors: true,
      headless: true,
      defaultViewport: chromium.defaultViewport,
    };
    puppeteer.use(Adblocker({ blockTrackers: true }));
    const browser = await puppeteer.launch(config);
    return browser;
  } catch (err) {
    throw new Error(err.message);
  }
};

export const closeBrowser = async ({ browser }: { browser: any }) => {
  await browser.close();
};
