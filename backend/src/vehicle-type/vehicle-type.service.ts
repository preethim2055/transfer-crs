import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import {deleteVehicleTypeDto} from './dto/delete-vehicle-type.dto'
import { updateVehicleTypeDto } from './dto/update-vehicle-type.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class VehicleTypeService {

   constructor(
        @InjectEntityManager()
    private readonly entityManager: EntityManager,

  ) {}

  async create(createVehicleTypeDto: CreateVehicleTypeDto) {
    const { Name, Status } = createVehicleTypeDto;

    const existingVehicle= await this.entityManager.query(
      `SELECT Name from Vehicle_type where Name=?`,[Name]
    )
    if (existingVehicle.length>0){
        throw new BadRequestException(`Vechile ${Name} already exists`)
    }
    const result=await this.entityManager.query(
        "INSERT INTO Vehicle_type (Name, Status) VALUES (?, ?)",
         [Name,Status]
    )

   console.log("Result:",result)
    return {
      message: 'Vehicle Type created successfully',
      insertId: result.insertId,
    };
  }

  async delete(deleteVehicleTypeDto:deleteVehicleTypeDto){
        const {id}=deleteVehicleTypeDto;

      const result=await this.entityManager.query(
        `DELETE FROM Vehicle_type WHERE id = ?`,[id]
      )

      if (result.affectedRows > 0) {
      return {
        message: 'Vehicle Type deleted successfully',
      };
    } else {
      return {
        message: `Vehicle Type with ID ${id} not found`,
      };
    }
  }

  async update(updateVehicleTypeDto:updateVehicleTypeDto){
    const {id,Name,Status}=updateVehicleTypeDto;

    const result=await this.entityManager.query(
      `UPDATE Vehicle_type SET Name = ?, Status = ? WHERE id = ?`,[Name,Status,id]
    )
     if (result.affectedRows > 0) {
      return {
        message: 'Vehicle Type updated successfully',
      };
    } else {
      return {
        message: `Vehicle Type with ID ${id} not found`,
      };
    }
  }

  async list()
  {
    const result=await this.entityManager.query(
      `select * from Vehicle_type`
    )
    return result;
  }
}