import { Body, Controller, Get, Post } from '@nestjs/common';
import { TeamsService } from './teams.service';

interface IBodyPostTeam {
  codeTeam: string;
  year: string;
}

@Controller('teams')
export class TeamsController {
  constructor(private teamsServices: TeamsService) {}

  @Get()
  getTeams() {
    return this.teamsServices.getTeams();
  }

  @Post()
  getInfo(@Body() body: IBodyPostTeam) {
    return this.teamsServices.getTeamByCode({ ...body });
  }

  @Post('roster')
  getRoster(@Body() body: IBodyPostTeam) {
    return this.teamsServices.getRoster({ ...body });
  }

  @Post('results')
  getResults(@Body() body: IBodyPostTeam) {
    return this.teamsServices.getResults({ ...body });
  }
}
