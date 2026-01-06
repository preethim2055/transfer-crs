import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { VehicleTypeModule } from './vehicle-type/vehicle-type.module';
import { TransferCrsModule } from './transfer-crs/transfer-crs.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // DEV only; set false in prod
    }),
    VehicleTypeModule,
    TransferCrsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
