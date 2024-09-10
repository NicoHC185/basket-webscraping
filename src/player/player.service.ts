import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { closeBrowser, initialBrowser } from 'src/utils';
import UserAgent from 'user-agents';
import { JSDOM } from 'jsdom';

@Injectable()
export class PlayerService {
  url = 'https://basketball-reference.com/players';

  create(createPlayerDto: CreatePlayerDto) {
    return 'This action adds a new player';
  }

  findAll() {
    return `This action returns all player`;
  }

  _getDataStat(el: Element, stat: string) {
    return el.querySelector(`[data-stat="${stat}"]`)?.textContent;
  }

  _getInfoSeason(el: Element) {
    return {
      season: this._getDataStat(el, 'season'),
      age: this._getDataStat(el, 'age'),
      team_id: this._getDataStat(el, 'team_id'),
      pos: this._getDataStat(el, 'pos'),
      g: this._getDataStat(el, 'g'),
      mp_per_g: this._getDataStat(el, 'mp_per_g'),
      fga_per_g: this._getDataStat(el, 'fga_per_g'),
      drb_per_g: this._getDataStat(el, 'drb_per_g'),
      trb_per_g: this._getDataStat(el, 'trb_per_g'),
      ast_per_g: this._getDataStat(el, 'ast_per_g'),
      stl_per_g: this._getDataStat(el, 'stl_per_g'),
      blk_per_g: this._getDataStat(el, 'blk_per_g'),
    };
  }

  async findOne(id: string) {
    try {
      const browser = await initialBrowser();
      const page = await browser.newPage();
      const userAgent = new UserAgent();
      await page.setUserAgent(userAgent.toString());
      await page.setViewport({
        width: 1920,
        height: 1080,
      });
      const urlFormat = `${this.url}/${id[0]}/${id}.html`;
      await page.goto(urlFormat);
      const elementsSeasons: string[] = await page.$$eval(
        '#per_game',
        (el: Element[]) => el.map((item) => item.outerHTML),
      );

      const arrSeason = elementsSeasons.map((el) => {
        const DOM = new JSDOM(`${el}`);
        const columns = DOM.window.document.querySelectorAll('tbody>tr');
        const data = [...columns].map((el) => this._getInfoSeason(el));
        return data;
      });

      closeBrowser({ browser });
      return { response: { seasonsInfo: arrSeason } };
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

  update(id: number, updatePlayerDto: UpdatePlayerDto) {
    return `This action updates a #${id} player`;
  }

  remove(id: number) {
    return `This action removes a #${id} player`;
  }
}
