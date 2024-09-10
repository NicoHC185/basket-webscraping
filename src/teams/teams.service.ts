import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { setTimeout } from 'timers/promises';
import { JSDOM } from 'jsdom';
import { closeBrowser, getElement, initialBrowser } from '../utils';
import {
  IConference,
  IGameResult,
  IInfoPlayer,
  IInfoTeam,
  ITeam,
} from 'src/interface';
import UserAgent from 'user-agents';
import { Page } from 'puppeteer';

@Injectable()
export class TeamsService {
  private url = `https://www.basketball-reference.com/leagues/`;
  private urlTeam = `https://www.basketball-reference.com/teams`;
  async getTeams() {
    try {
      const browser = await initialBrowser();
      const page = await browser.newPage();
      const userAgent = new UserAgent();
      await page.setUserAgent(userAgent.toString());
      await page.setViewport({
        width: 1920,
        height: 1080,
      });
      await page.goto(this.url);
      await page.hover('#header_teams');
      setTimeout(300);
      const elements: string[] = await page.$$eval(
        '#header_teams>div>.list',
        (el: Element[]) => el.map((item) => item.outerHTML),
      );
      const res: IConference[] = elements.map((el) => {
        const DOM = new JSDOM(el);
        return this._getConferences(DOM.window.document);
      });
      closeBrowser({ browser });
      return { response: res };
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: err.message,
        },
      );
    }
  }

  private _getConferences(el: Document): IConference {
    const name = el.getElementsByTagName('h4')[0]?.textContent;
    const teamsElements = el.querySelectorAll('table>tbody>tr');
    const teams: ITeam[] = this._getTeams({ teamsHTML: teamsElements }).sort(
      (a, b) => (a.victories < b.victories ? 1 : -1),
    );
    return {
      name,
      teams,
    };
  }

  private _getTeams({
    teamsHTML,
  }: {
    teamsHTML: NodeListOf<Element>;
  }): ITeam[] {
    const teams = [...teamsHTML].map((el) => {
      const href = el?.querySelector('td>a')?.getAttribute('href');
      const code = href?.split('/')[2].toLowerCase() || '';
      const regex = /\(|\)/g;
      const textContentSplit =
        el?.textContent?.replace('F$', '').replace(regex, '-').split('-') || [];
      const name = textContentSplit[0];
      const victories = Number(textContentSplit[1]) || 0;
      const defeats = Number(textContentSplit[2]) || 0;
      return {
        name,
        victories,
        defeats,
        code: code,
      };
    });
    return teams;
  }

  async getTeamByCode({ codeTeam, year }: { codeTeam: string; year: string }) {
    const url = `${this.urlTeam}/${codeTeam}/${year}.html`;
    const browser = await initialBrowser();
    const page = await browser.newPage();
    const userAgent = new UserAgent();
    await page.setUserAgent(userAgent.toString());
    await page.setViewport({
      width: 1920,
      height: 1080,
    });
    await page.goto(url);
    const infoTeam = await this._getInfoTeam({ page: page });
    await browser.close();
    return { response: infoTeam };
  }

  async getRoster({ codeTeam, year }: { codeTeam: string; year: string }) {
    const url = `${this.urlTeam}/${codeTeam}/${year}.html`;
    const browser = await initialBrowser();
    const page = await browser.newPage();
    const userAgent = new UserAgent();
    await page.setUserAgent(userAgent.toString());
    await page.setViewport({
      width: 1920,
      height: 1080,
    });
    await page.goto(url);
    const roster = await this._getRoster({ page: page });
    await browser.close();
    return { response: roster };
  }

  private _getInfoTeam = async ({
    page,
  }: {
    page: any;
  }): Promise<IInfoTeam> => {
    const teamDocument = await getElement(
      page,
      `[data-template="Partials/Teams/Summary"]`,
    );
    const name = teamDocument
      .getElementsByTagName('h1')[0]
      .querySelectorAll('span')[1].textContent;

    const info = [...teamDocument.querySelectorAll('p')].map((el) => {
      const newText = String(el.textContent)
        .replace(/[\n\t]+/g, '')
        .split(' ')
        .filter((el) => el !== '')
        .join(' ');
      return newText;
    });
    const res: IInfoTeam = {
      name: name,
      record: info.find((el) => /Record/.test(el))?.split(':')[1] || '',
      coach: info.find((el) => /Coach/.test(el))?.split(':')[1] || '',
      executive: info.find((el) => /Executive/.test(el))?.split(':')[1] || '',
    };
    return res;
  };

  private async _getRoster({ page }: { page: any }): Promise<IInfoPlayer[]> {
    const tableDocument = await getElement(page, `#all_roster>div>table`);
    const rows = tableDocument.querySelectorAll('tbody>tr');
    const roster: IInfoPlayer[] = [...rows].map((row) => {
      return this._getInfoPlayer({ row });
    });
    return roster;
  }

  private _getInfoPlayer({ row }: { row: Element }): IInfoPlayer {
    const number = row.querySelector('[data-stat="number"]')?.textContent;
    const player = row.querySelector('[data-stat="player"]')?.textContent;
    const playerRef = row.querySelector('a')?.href;
    const playerPos = row.querySelector('[data-stat="pos"]')?.textContent;
    const playerCountry = row.querySelector(
      '[data-stat="birth_country"]',
    )?.textContent;
    const infoPlayer: IInfoPlayer = {
      number,
      name: player,
      position: playerPos,
      country: playerCountry,
      href: playerRef,
    };
    return infoPlayer;
  }

  async getResults({ codeTeam, year }: { codeTeam: string; year: string }) {
    const url = `${this.urlTeam}/${codeTeam}/${year}.html`;
    const browser = await initialBrowser();
    const page = await browser.newPage();
    const userAgent = new UserAgent();
    await page.setUserAgent(userAgent.toString());
    await page.setViewport({
      width: 1920,
      height: 1080,
    });
    await page.goto(url);
    const result = await this._getGameResult({ page: page });
    await browser.close();
    return { response: result };
  }

  private async _getGameResult({
    page,
  }: {
    page: any;
  }): Promise<IGameResult[]> {
    const document = await getElement(page, `#timeline_results`);
    const result = [...document.querySelectorAll('ul>li')]
      .filter((el) => el.className === 'result')
      .map((el) => {
        const textSplit = String(el.textContent).split(',');
        const dateSplit = textSplit[0]
          .replace(/(\r\n|\n|\r)/gm, '')
          .split('.')[1]
          .split(' ');
        const teamsSplit = textSplit[1].split(' ');
        const date = `${dateSplit[1]} ${dateSplit[2]}`;
        const teams = [teamsSplit[1], teamsSplit.slice(-1)[0]];
        const result = teamsSplit[2].match(/\d+/g);
        const score = String(textSplit[2])
          .replace(/(\r\n|\n|\r)/gm, '')
          .split(' ')[1]
          .split('-');
        return {
          date,
          teams,
          result,
          score,
        };
      });
    return result;
  }
}
