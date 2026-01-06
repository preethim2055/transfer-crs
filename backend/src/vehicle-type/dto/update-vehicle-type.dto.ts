import {IsString, IsBoolean,IsNumber} from 'class-validator';
export class updateVehicleTypeDto {


  @IsNumber()
  id?:number;

  @IsString()
  Name?: string;

  @IsBoolean()
  Status?:boolean;

}
