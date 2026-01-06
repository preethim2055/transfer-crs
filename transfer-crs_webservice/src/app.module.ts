import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransfercrsModule } from './webservice/transfercrs/transfercrs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({

  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
       TypeOrmModule.forRoot({
       type: 'mysql',
       host: 'localhost',
       port: 3306,
       username: 'root',
       password: 'admin@123@',
       database: 'transfer',
       autoLoadEntities: true,
       synchronize: false,

    }),
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule.forRoot({
      config: {
        host: 'localhost',
        port: 6379,
      }
    }, true),

    TransfercrsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
