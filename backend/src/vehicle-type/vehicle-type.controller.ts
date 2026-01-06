import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { VehicleTypeService } from './vehicle-type.service';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { updateVehicleTypeDto } from './dto/update-vehicle-type.dto';
import {deleteVehicleTypeDto} from './dto/delete-vehicle-type.dto'

@Controller('vehicle-type')
export class VehicleTypeController {
  constructor(private readonly vehicleTypeService: VehicleTypeService) {}

  @HttpCode(200)
  @Post('addVehicleType')
  async create(@Body() createVehicleTypeDto: CreateVehicleTypeDto) {
    return this.vehicleTypeService.create(createVehicleTypeDto);
  }

  @HttpCode(200)
  @Post('deleteVehicleType')
  async delete(@Body() deleteVehicleTypeDto:deleteVehicleTypeDto){
    return this.vehicleTypeService.delete(deleteVehicleTypeDto);
  }

  @HttpCode(200)
  @Post('updateVehicleType')
  async update(@Body() updateVehicleTypeDto:updateVehicleTypeDto){
    return this.vehicleTypeService.update(updateVehicleTypeDto);
  }

  @HttpCode(200)
  @Post('vehicleTypeList')
  async list(@Body() body:any){
  return this.vehicleTypeService.list()
  }
}

