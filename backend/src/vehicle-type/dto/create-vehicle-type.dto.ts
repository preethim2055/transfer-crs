import {IsString, IsBoolean,IsNumber} from 'class-validator';
export class CreateVehicleTypeDto {


  @IsNumber()
  id?:number;

  @IsString()
  Name?: string;

  @IsBoolean()
  Status?:boolean;

}
