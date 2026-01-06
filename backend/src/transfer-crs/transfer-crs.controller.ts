import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { TransferCrsService } from './transfer-crs.service';
import { CreateTransferCrDto } from './dto/create-transfer-cr.dto';
import { UpdateTransferCrDto } from './dto/update-transfer-cr.dto';
import { addVehicle } from './dto/add-vehicle.dto';
import {CreateSeasonPriceDto} from './dto/season-price.dto'
import { UpdateRouteDto } from './dto/updateRoute.dto';
import { UpdateSeasonDto } from './dto/updateRoute.dto';

@Controller('transfer-crs')
export class TransferCrsController {
  constructor(private readonly transferCrsService: TransferCrsService) {}

  @HttpCode(200)
  @Post('addVehicleMaster')
  async create(@Body() createTransferCrDto: CreateTransferCrDto) {
    return this.transferCrsService.create(createTransferCrDto);
  }

  @HttpCode(200)
  @Post('deleteVehicleMaster')
  async delete(@Body() body:any)
  {
    return this.transferCrsService.delete(body)
  }

  @HttpCode(200)
  @Post('updateVehicleMaster')
  async update(@Body() UpdateTransferCrDto:UpdateTransferCrDto)
  {
    return this.transferCrsService.update(UpdateTransferCrDto);
  }

  @HttpCode(200)
  @Post('vehicleMasterList')
  async list(@Body() body:any)
  {
      return this.transferCrsService.list(body)
  }

  @HttpCode(200)
  @Post('addVehicle')
  async add(@Body() addVehicle:addVehicle)
  {
    return this.transferCrsService.add(addVehicle)
  }

  @HttpCode(200)
  @Post('deleteVehicle')
  async deleteVehicle(@Body() body:any)
  {
    return this.transferCrsService.deleteVehicle(body)
  }

  @HttpCode(200)
  @Post('listVehicle')
  async listvehicle(@Body() body:any)
  {
      return this.transferCrsService.listVehicle(body)
  }

  @HttpCode(200)
  @Post('updateRoute')
  async updateRoute(@Body() body:UpdateRouteDto)
  {
    return this.transferCrsService.updateRoute(body)
  }

   @HttpCode(200)
  @Post('updateSeasons')
  async updateSeasons(@Body() body:UpdateSeasonDto)
  {
    return this.transferCrsService.updateSeasons(body)
  }
}
