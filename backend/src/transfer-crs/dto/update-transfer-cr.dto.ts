import { PartialType } from '@nestjs/mapped-types';
import { CreateTransferCrDto } from './create-transfer-cr.dto';

import {IsString, IsBoolean,IsNumber,IsOptional} from 'class-validator';
export class UpdateTransferCrDto extends PartialType(CreateTransferCrDto) {

  @IsNumber()
  id?:number

   @IsNumber()
  vehicle_type?:number;

  @IsString()
  vehicle_name?: string;

  @IsBoolean()
  ac_vehicle?:boolean;

  @IsNumber()
  max_capacity?:number;

  @IsString()
  luggage_allowances?:string;

  @IsString()
  ride_type?:string;

  @IsString()
  ratings?:string;

   @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  status?:boolean;
}

