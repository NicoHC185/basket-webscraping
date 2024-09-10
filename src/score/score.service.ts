import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { closeBrowser, initialBrowser } from 'src/utils';
import UserAgent from 'user-agents';
import { IScrore } from './score.controller';
import { JSDOM } from 'jsdom';

function querySelector(
  document: Document,
  selectors: string,
  isAll?: boolean,
): any {
  if (isAll) {
    return [...document.querySelectorAll(selectors)];
  } else {
    return document.querySelector(selectors);
  }
}
const infoGame = (DOM: Document, className: string) => {
  const infoTeam = [...DOM.querySelectorAll(`table>tbody>${className}>td`)];
  const infoTxt = infoTeam[0].innerHTML;
  const el = new JSDOM(infoTxt).window.document;
  const a = querySelector(el, 'a');
  const codTeam = a.getAttribute('href').split('/')[2];
  const nameTeam = a.textContent;
  const score = infoTeam[1].innerHTML;
  return {
    codTeam,
    nameTeam,
    score,
  };
};

@Injectable()
export class ScoreService {
  private url = `https://www.basketball-reference.com/boxscores/`;
  create(createScoreDto: CreateScoreDto) {
    return 'This action adds a new score';
  }

  async getScore(body: IScrore) {
    const { month, day, year } = body;
    try {
      const browser = await initialBrowser();
      const page = await browser.newPage();
      const userAgent = new UserAgent();
      await page.setUserAgent(userAgent.toString());
      await page.setViewport({
        width: 1920,
        height: 1080,
      });
      const urlFormat = `${this.url}?month=${month}&day=${day}&year=${year}`;
      await page.goto(urlFormat);
      const elements: string[] = await page.$$eval(
        '#content .game_summaries .game_summary',
        (el: Element[]) => el.map((item) => item.outerHTML),
      );

      const arr = elements.map((el) => {
        const DOM = new JSDOM(el).window.document;
        const teamWinner = infoGame(DOM, 'tr.winner');
        const teamLoser = infoGame(DOM, 'tr.loser');
        return { teamWinner, teamLoser };
      });

      closeBrowser({ browser });
      return { response: arr };
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

  findAll() {
    return `This action returns all score`;
  }

  findOne(id: number) {
    return `This action returns a #${id} score`;
  }

  update(id: number, updateScoreDto: UpdateScoreDto) {
    return `This action updates a #${id} score`;
  }

  remove(id: number) {
    return `This action removes a #${id} score`;
  }
}
