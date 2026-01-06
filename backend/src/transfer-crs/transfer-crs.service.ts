import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTransferCrDto } from './dto/create-transfer-cr.dto';
import { UpdateTransferCrDto } from './dto/update-transfer-cr.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { addVehicle } from './dto/add-vehicle.dto';
import { UpdateRouteDto } from './dto/updateRoute.dto';
import { UpdateSeasonDto } from './dto/updateRoute.dto';





@Injectable()
export class TransferCrsService {
     constructor(
          @InjectEntityManager()
      private readonly entityManager: EntityManager,

    ) {}


  async create(createTransferCrDto: CreateTransferCrDto) {
    const {vehicle_type,vehicle_name,ac_vehicle,max_capacity,luggage_allowances,ratings,image,status}=createTransferCrDto;

      console.log(vehicle_type)
      const existingVehicleType=await this.entityManager.query(
        `select id from Vehicle_type where id=?`,
        [vehicle_type]
      )

      if (existingVehicleType.length===0)
        {
          return {
            message:`vehicletype ${vehicle_type} does not exist`,
            statusCode:200
          }
        }
      const existing= await this.entityManager.query(
      `select vehicle_name from VehicleMaster where vehicle_name=?`,[vehicle_name]);
      if (existing.length > 0)
        {

      return {
      message: `Vehicle name '${vehicle_name}' already exists`,
      statusCode: 200,
    };
      }
    const res=await this.entityManager.query(
        `INSERT INTO VehicleMaster (vehicle_type,vehicle_name,ac_vehicle,max_capacity,luggage_allowances,ratings,image,status) values
        (?,?,?,?,?,?,?,?)`,
        [
          vehicle_type,
          vehicle_name,
          ac_vehicle,
          max_capacity,
          luggage_allowances,
          ratings,
          image,
          status
        ]
    )

     return {
       message: "Vehicle added successfully",
       id: res.insertId,
       };
  }


  async delete(body:any){

      const exist=await this.entityManager.query(
          `select id from VehicleMaster where id=?`,[body.id]
      )
      if(exist.length===0)
        {
            return{
              message:`vehicle id ${body.id} doesn't exist`,
              statusCode:200
            }
        }
      const res=await this.entityManager.query(
        `DELETE FROM VehicleMaster WHERE id = ?`,[body.id]
      )
      return{
        message:"Vehicle deleted successfully",
        statusCode:200
      }
  }

  async update(UpdateTransferCrDto:UpdateTransferCrDto){
    const {id,vehicle_type,vehicle_name,ac_vehicle,max_capacity,luggage_allowances,ratings,image,status}=UpdateTransferCrDto;

    const exist=await this.entityManager.query(
     `select id from VehicleMaster where id=?`,[id]
     )

     if(exist.length===0){
      return{
        message:`id ${id} not found`,
        statusCode:200
      }
     }
    const res=await this.entityManager.query(
      `update VehicleMaster SET vehicle_type=?,
      vehicle_name=?,
      ac_vehicle=?,
      max_capacity=?,
      luggage_allowances=?,
      ratings=?,image=?,
      status=? where id=?`,
      [vehicle_type,vehicle_name,ac_vehicle,max_capacity,luggage_allowances,ratings,image,status,id]
    )
       return {
        message:"Updated Successfully",
        statusCode:200
       }
  }

  async list(body:any){
    const res=await this.entityManager.query(
      `select * from VehicleMaster`
    )
    return res;
  }


async add(addVehicle: addVehicle) {
  const {
    vehicle_type_id,
    vehicle_name_id,
    starting_point,
    ending_point,
    duration_hours,
    duration_minutes,
    return_trip,
    cancellation_type,
    cancellation_fee,
    cancellation_days,
    seasons
  } = addVehicle;


  const typeExists = await this.entityManager.query(
    `SELECT id FROM Vehicle_type WHERE id = ?`,
    [vehicle_type_id]
  );
  if (typeExists.length === 0) {
    return { message: "Invalid vehicle type", status: 400 };
  }


  const nameExists = await this.entityManager.query(
    `SELECT id FROM VehicleMaster WHERE id = ? AND vehicle_type = ?`,
    [vehicle_name_id, vehicle_type_id]
  );
  if (nameExists.length === 0) {
    return {
      message: "Vehicle name does not belong to the selected vehicle type",
      status: 400
    };
  }

  const existingRoute = await this.entityManager.query(
    `
      SELECT id FROM SupplierVehicle
      WHERE vehicle_type_id = ?
      AND vehicle_name_id = ?
      AND starting_point = ?
      AND ending_point = ?
    `,
    [vehicle_type_id, vehicle_name_id, starting_point, ending_point]
  );

  let supplier_vehicle_id;

  if (existingRoute.length > 0) {

    supplier_vehicle_id = existingRoute[0].id;
  } else {

    const newRoute = await this.entityManager.query(
      `INSERT INTO SupplierVehicle
     (vehicle_type_id, vehicle_name_id, starting_point, ending_point,
      duration_hours, duration_minutes, return_trip,
      cancellation_type, cancellation_fee, cancellation_days)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehicle_type_id,
        vehicle_name_id,
        starting_point,
        ending_point,
        duration_hours,
        duration_minutes,
        return_trip,
        cancellation_type,
        cancellation_fee,
        cancellation_days
      ]
    );

    supplier_vehicle_id = newRoute.insertId;
  }


  if (seasons && seasons.length > 0) {
    for (const season of seasons) {

      if (new Date(season.start_date) > new Date(season.end_date)) {
        return {
          message: `Invalid date range: ${season.start_date} to ${season.end_date}`,
          status: 400
        };
      }

      const overlapCheck = await this.entityManager.query(
        `SELECT id
         FROM SupplierVehicleSeasonPrice
         WHERE supplier_vehicle_id = ?
         AND (
              (start_date <= ? AND end_date >= ?) OR
              (start_date <= ? AND end_date >= ?) OR
              (? <= start_date AND ? >= end_date)
         )`,
        [
          supplier_vehicle_id,
          season.start_date, season.start_date,
          season.end_date, season.end_date,
          season.start_date, season.end_date
        ]
      );

      if (overlapCheck.length > 0) {
        return {
          message: `Season overlaps with existing period: ${season.start_date} - ${season.end_date}`,
          status: 400
        };
      }

      await this.entityManager.query(
        `INSERT INTO SupplierVehicleSeasonPrice
         (supplier_vehicle_id, start_date, end_date, base_price)
         VALUES (?, ?, ?, ?)`,
        [
          supplier_vehicle_id,
          season.start_date,
          season.end_date,
          season.base_price
        ]
      );
    }
  }

  return {
    message: "Route and/or seasons added successfully",
    status: 200
  };
}



  async deleteVehicle(body:any){
        const res=await this.entityManager.query(
        `DELETE FROM SupplierVehicle WHERE id = ?`,[body.id]
      )
      return{
        message:"Vehicle deleted successfully",
        statusCode:200
      }
  }

  async listVehicle(body:any)
  {
    const routes = await this.entityManager.query(`
    SELECT * FROM SupplierVehicle
  `);


  for (let route of routes) {
    const seasons = await this.entityManager.query(`
      SELECT id, start_date, end_date, base_price
      FROM SupplierVehicleSeasonPrice
      WHERE supplier_vehicle_id = ?
      ORDER BY start_date
    `, [route.id]);

    route.seasons = seasons;
  }

  return routes;
  }

  async updateRoute(updateRoute: UpdateRouteDto) {
  const { route_id, starting_point, ending_point, duration_hours, duration_minutes,
          return_trip, cancellation_type, cancellation_fee, cancellation_days } = updateRoute;

  const routeExists = await this.entityManager.query(
    `SELECT * FROM SupplierVehicle WHERE id = ?`,
    [route_id]
  );

  if (routeExists.length === 0) {
    return { message: "Route not found", status: 404 };
  }


  if (starting_point || ending_point) {
    const duplicateCheck = await this.entityManager.query(
      `SELECT id FROM SupplierVehicle
       WHERE vehicle_type_id = ?
         AND vehicle_name_id = ?
         AND starting_point = ?
         AND ending_point = ?
         AND id != ?`,
      [
        routeExists[0].vehicle_type_id,
        routeExists[0].vehicle_name_id,
        starting_point || routeExists[0].starting_point,
        ending_point || routeExists[0].ending_point,
        route_id
      ]
    );

    if (duplicateCheck.length > 0) {
      return { message: "This vehicle route already exists", status: 409 };
    }
  }

  await this.entityManager.query(
    `UPDATE SupplierVehicle SET
      starting_point = ?,
      ending_point = ?,
      duration_hours = ?,
      duration_minutes = ?,
      return_trip = ?,
      cancellation_type = ?,
      cancellation_fee = ?,
      cancellation_days = ?
      WHERE id = ?`,
    [
      starting_point || routeExists[0].starting_point,
      ending_point || routeExists[0].ending_point,
      duration_hours ?? routeExists[0].duration_hours,
      duration_minutes ?? routeExists[0].duration_minutes,
      return_trip ?? routeExists[0].return_trip,
      cancellation_type || routeExists[0].cancellation_type,
      cancellation_fee ?? routeExists[0].cancellation_fee,
      cancellation_days ?? routeExists[0].cancellation_days,
      route_id
    ]
  );

  return { message: "Route updated successfully", status: 200 };
}

async updateSeasons(updateDto: UpdateSeasonDto) {
  const { route_id, seasons } = updateDto;

  // 1. Check if Route exists
  const route = await this.entityManager.query(
    `SELECT id FROM SupplierVehicle WHERE id = ?`,
    [route_id],
  );

  if (route.length === 0) {
    return { status: 404, message: "Route not found" };
  }

  for (const s of seasons) {
    // 2. OVERLAP VALIDATION logic
    // Checks if any existing record for this route overlaps with s.start_date and s.end_date
    // We exclude the current season's ID if we are doing an UPDATE
    const overlapQuery = `
      SELECT id FROM SupplierVehicleSeasonPrice
      WHERE supplier_vehicle_id = ?
      AND id != ?
      AND (
        (start_date <= ? AND end_date >= ?) OR
        (start_date <= ? AND end_date >= ?) OR
        (? <= start_date AND ? >= end_date)
      ) LIMIT 1`;

    const conflict = await this.entityManager.query(overlapQuery, [
      route_id,
      s.id || 0, // Use 0 for new inserts
      s.start_date, s.start_date, // Start date overlaps existing range
      s.end_date, s.end_date,     // End date overlaps existing range
      s.start_date, s.end_date    // New range completely wraps an existing range
    ]);

    if (conflict.length > 0) {
      return {
        status: 400,
        message: `Date conflict detected for range ${s.start_date} to ${s.end_date}. Please adjust your seasons.`
      };
    }

    // 3. Process the Data if no conflict
    if (s.id) {
      await this.entityManager.query(
        `UPDATE SupplierVehicleSeasonPrice SET
            start_date = ?, end_date = ?, base_price = ?
         WHERE id = ? AND supplier_vehicle_id = ?`,
        [s.start_date, s.end_date, s.base_price, s.id, route_id],
      );
    } else {
      await this.entityManager.query(
        `INSERT INTO SupplierVehicleSeasonPrice
          (supplier_vehicle_id, start_date, end_date, base_price)
         VALUES (?, ?, ?, ?)`,
        [route_id, s.start_date, s.end_date, s.base_price]
      );
    }
  }

  return { status: 200, message: "Seasons processed successfully" };
}


}
