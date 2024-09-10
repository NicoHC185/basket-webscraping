import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TeamsModule } from './teams/teams.module';
import { ScoreModule } from './score/score.module';
import { PlayerModule } from './player/player.module';

@Module({
  imports: [TeamsModule, ScoreModule, PlayerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
