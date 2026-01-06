import { Controller, Post, Body } from '@nestjs/common';
import { TransfercrsService } from './transfercrs.service';

@Controller('transfercrs')
export class TransfercrsController {
  constructor(private readonly transfercrsService: TransfercrsService) {}

   @Post('autosuggest')
  async autosuggest(@Body() dto:any) {
    return this.transfercrsService.autosuggest(dto);
  }

  @Post('availability')
  async availability(@Body() body:any){
    return this.transfercrsService.availability(body)
  }

   @Post('info')
  async info(@Body() body:any){
    return this.transfercrsService.info(body)
  }

  @Post('blocktrip')
  async blocktrip(@Body() body:any){
    return this.transfercrsService.blocktrip(body)
  }


  @Post("createAppReference")
  async createAppReference(@Body() body: any): Promise<any> {
    return await this.transfercrsService.createAppReference(body);
  }

  @Post('passengerdetails')
async passengerdetails(@Body() body: any) {
  return this.transfercrsService.passengerdetails(body);
}

@Post('confirmBooking')
async confirmBooking(@Body() body: any) {
  return this.transfercrsService.confirmBooking(body);
}

@Post('cancel')
async cancel(@Body() body: any) {
  return this.transfercrsService.cancelBooking(body);
}

}
