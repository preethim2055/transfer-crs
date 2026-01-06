import { Module } from '@nestjs/common';
import { TransferCrsService } from './transfer-crs.service';
import { TransferCrsController } from './transfer-crs.controller';

@Module({
  controllers: [TransferCrsController],
  providers: [TransferCrsService],
})
export class TransferCrsModule {}
