import {IsNumber} from 'class-validator';
export class deleteVehicleTypeDto {


  @IsNumber()
  id?:number;


}
