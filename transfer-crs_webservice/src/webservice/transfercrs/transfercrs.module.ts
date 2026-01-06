import { Module } from '@nestjs/common';
import { TransfercrsService } from './transfercrs.service';
import { TransfercrsController } from './transfercrs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
 imports: [
    TypeOrmModule.forFeature([], 'default'),
    RedisModule
  ],
  controllers: [TransfercrsController],
  providers: [TransfercrsService],
    exports: [TransfercrsService],
})
export class TransfercrsModule {}
