import { BadRequestException, ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import { AutoCompleteDto } from './dto/create-transfercr.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import * as crypto from 'crypto';
import { RedisService } from '@liaoliaots/nestjs-redis';
import * as nodemailer from 'nodemailer';

@Injectable()
export class TransfercrsService {
constructor(
  @InjectEntityManager('default')
  private readonly entityManager: EntityManager,
  private readonly redisService: RedisService,


) {}

private get redis() {
    return this.redisService.getOrThrow();
  }

  private generateToken() {
    return crypto.randomBytes(20).toString('hex');
  }

   async autosuggest(dto:any) {
    const res=await this.entityManager.query(`
      select city_name from cities where city_name like "%${dto.DestName}%"`)
       return res;
  }

async availability(body: any) {
  const res = await this.entityManager.query(
    `SELECT
      s.id AS supplier_vehicle_id,
      s.starting_point,
      s.ending_point,
      s.duration_hours,
      s.duration_minutes,
      s.return_trip,
      sv.base_price,
      vm.vehicle_name,
      vm.image,
      vm.max_capacity,
      vt.Name AS vehicle_type_name
    FROM SupplierVehicle s
    JOIN SupplierVehicleSeasonPrice sv ON s.id = sv.supplier_vehicle_id
    JOIN VehicleMaster vm ON s.vehicle_name_id = vm.id
    JOIN Vehicle_type vt ON s.vehicle_type_id = vt.id
    WHERE s.starting_point = ?
      AND s.ending_point = ?
      AND ? BETWEEN sv.start_date AND sv.end_date`,
    [body.starting_point, body.ending_point, body.start_date]
  );

  const finalResults = await Promise.all(res.map(async (item) => {
    const resultToken = this.generateToken();

    // We cache 'travelDate' here so the next function can find it
    const dataToCache = {
      ...item,
      travelDate: body.start_date
    };

    await this.redis.set(`search_token:${resultToken}`, JSON.stringify(dataToCache), 'EX', 1800);
    return { ...item, ResultToken: resultToken };
  }));

  return finalResults;
}

async info(body: any) {
  const { ResultToken } = body;
  const cachedData = await this.redis.get(`search_token:${ResultToken}`);

  if (!cachedData) throw new BadRequestException("Session expired or Token invalid");

  const tripData = JSON.parse(cachedData);
  const vehicleId = tripData.supplier_vehicle_id;
  const travelDate = tripData.travelDate; // Retrieved correctly from search cache

  if (!travelDate) {
    throw new BadRequestException("Travel date missing from session. Please search again.");
  }

  const vehicleDetails = await this.entityManager.query(`
    SELECT
      sv.id, sv.starting_point, sv.ending_point, sv.duration_hours,
      sv.duration_minutes, sv.return_trip, sv.cancellation_type,
      sv.cancellation_fee, sv.cancellation_days,
      vm.vehicle_name, vt.Name as vehicle_type_name, vm.image, vm.max_capacity,
      sp.base_price as seasonal_price
    FROM SupplierVehicle sv
    JOIN VehicleMaster vm ON sv.vehicle_name_id = vm.id
    JOIN Vehicle_type vt ON sv.vehicle_type_id = vt.id
    LEFT JOIN SupplierVehicleSeasonPrice sp ON sv.id = sp.supplier_vehicle_id
      AND ? BETWEEN sp.start_date AND sp.end_date
    WHERE sv.id = ?
  `, [travelDate, vehicleId]);

  if (vehicleDetails.length === 0) throw new NotFoundException("Vehicle not found");

  const fullDetails = vehicleDetails[0];
  const detailsToken = this.generateToken();

  // Create the final response object
  const response = {
    // Add this line so blocktrip knows which vehicle to query for policy
    supplier_vehicle_id: fullDetails.id,
    id: fullDetails.id,
    starting_point: fullDetails.starting_point,
    ending_point: fullDetails.ending_point,
    duration_hours: fullDetails.duration_hours,
    duration_minutes: fullDetails.duration_minutes,
    return_trip: fullDetails.return_trip,
    cancellation_type: fullDetails.cancellation_type,
    cancellation_fee: fullDetails.cancellation_fee,
    cancellation_days: fullDetails.cancellation_days,
    vehicle_name: fullDetails.vehicle_name,
    vehicle_type_name: fullDetails.vehicle_type_name,
    image: fullDetails.image,
    max_capacity: fullDetails.max_capacity,
    base_price: fullDetails.seasonal_price || "0.00",

    // --- KEY FIX HERE ---
    travel_date: travelDate, // Pass the date into this new object
    // --------------------

    DetailsToken: detailsToken
  };

  // Save the ENTIRE response (including travel_date) to the details_token key
  await this.redis.set(`details_token:${detailsToken}`, JSON.stringify(response), 'EX', 1800);

  return response;
}
async blocktrip(body: any) {
    const { DetailsToken, app_reference, booking_source } = body;

    const cachedData = await this.redis.get(`details_token:${DetailsToken}`);
    if (!cachedData) throw new BadRequestException("Session expired.");

    const trip = JSON.parse(cachedData);

    // --- FIX START ---
    // Check for 'start_date' (used in search) OR 'travel_date'
    const travel_date = trip.travel_date;

    if (!travel_date) {
        // This stops the crash and tells you exactly what's wrong
        throw new BadRequestException("Travel date was not found in the session. Please restart your search.");
    }
    // --- FIX END ---

    const vehiclePolicy = await this.entityManager.query(
      `SELECT cancellation_type, cancellation_fee, cancellation_days FROM SupplierVehicle WHERE id = ?`,
      [trip.supplier_vehicle_id]
    );

    const policy = vehiclePolicy[0] || { cancellation_type: 'PERCENT', cancellation_fee: 0, cancellation_days: 0 };

    await this.entityManager.query(
      `INSERT INTO transfer_booking_details
      (
        app_reference, booking_status, booking_source, supplier_vehicle_id,
        starting_point, ending_point, travel_date, total_price, currency,
        cancellation_type, cancellation_fee, cancellation_days
      )
      VALUES (?, 'INITIATED', ?, ?, ?, ?, ?, ?, 'INR', ?, ?, ?)`,
      [
        app_reference,
        booking_source,
        trip.supplier_vehicle_id,
        trip.starting_point,
        trip.ending_point,
        travel_date,
        trip.base_price,
        policy.cancellation_type,
        policy.cancellation_fee,
        policy.cancellation_days
      ]
    );

    return { status: 200, message: 'Trip blocked successfully', app_reference };
}


   async createAppReference(body: any) {
    try {
      let query = "SELECT app_reference FROM transfer_booking_details ORDER BY id DESC LIMIT 1";


      const result = await this.entityManager.query(query);
      let last_app_reference: any;
      if (result[0]) {
        last_app_reference = result[0].app_reference;
      }
      if (last_app_reference && (last_app_reference.startsWith("AWT") || last_app_reference.startsWith("BG"))) {
        const number = parseInt(last_app_reference.split("-")[1]) + 1;
        const number_length = JSON.stringify(number).length;
        var serialNumber = JSON.stringify(number);
        if (number_length == 1) {
          serialNumber = "00" + number;
        } else if (number_length == 2) {
          serialNumber = "0" + number;
        }
        const app_reference =
          last_app_reference.substring(0, 4) +
          "-" +
          serialNumber;
        return app_reference;
      } else {
        var app_reference = "BGTR" + "-" + "001";

        return app_reference;
      }
    } catch (error) {
      throw (error.message);
    }
  }

  async passengerdetails(body: any) {
  const { app_reference, passengers } = body;

  // 1. Get the primary 'id' from transfer_booking_details using app_reference
  const booking = await this.entityManager.query(
    `SELECT id FROM transfer_booking_details WHERE app_reference = ?`,
    [app_reference]
  );

  if (booking.length === 0) {
    throw new BadRequestException("Booking reference not found.");
  }

  const bookingId = booking[0].id;

  // 2. Loop through passengers and insert them
  // Based on your image: booking_id, title, first_name, last_name, mobile, email
  for (const pax of passengers) {
    await this.entityManager.query(
      `INSERT INTO transfer_passenger_details
      (booking_id, title, first_name, last_name, mobile, email)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        bookingId,
        pax.title,
        pax.first_name,
        pax.last_name,
        pax.mobile,
        pax.email
      ]
    );
  }

  return {
    status: 200,
    message: "Passenger details added successfully",
    app_reference
  };
}
async confirmBooking(body: any) {
    const { app_reference, booking_source, payment_mode, payment_id } = body;

    const existing = await this.entityManager.query(
      `SELECT id, booking_status FROM transfer_booking_details WHERE app_reference = ?`,
      [app_reference]
    );

    if (existing.length === 0) throw new BadRequestException("Booking not found.");
    if (existing[0].booking_status === 'CONFIRMED') throw new ConflictException("Booking is already confirmed.");

    const bookingId = existing[0].id;

    // ... (Keep your passenger validation here) ...

    await this.entityManager.query(
      `UPDATE transfer_booking_details
       SET booking_status = 'CONFIRMED',
           payment_mode = ?,
           confirmed_at = NOW()
       WHERE app_reference = ?`,
      [payment_mode, app_reference]
    );

    // FIX: Don't use 'await' here if you want the UI to flip immediately
    // OR wrap it so errors don't stop the response.
    this.sendVoucherEmail(app_reference).catch(err => console.error("Email error:", err));

    // This return MUST be reached for the frontend to flip to Step 3
    return {
      status: 200,
      message: `Booking CONFIRMED successfully.`,
      app_reference,
    };
}
  async sendVoucherEmail(appReference: string) {

    const bookingData = await this.entityManager.query(
      `SELECT b.*, p.first_name, p.last_name, p.email
       FROM transfer_booking_details b
       JOIN transfer_passenger_details p ON b.id = p.booking_id
       WHERE b.app_reference = ? LIMIT 1`,
      [appReference]
    );

    if (bookingData.length === 0) return;

    const data = bookingData[0];


    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'preethim2055@gmail.com',
        pass: 'zfsb wbcd osjb qxdg',
      },
    });

    const mailOptions = {
      from: '"Transfer CRS" <your-email@gmail.com>',
      to: data.email,
      subject: `Booking Confirmation - ${appReference}`,
      html: `
        <h1>Booking Confirmed!</h1>
        <p>Dear ${data.first_name},</p>
        <p>Your transfer from <b>${data.starting_point}</b> to <b>${data.ending_point}</b> is confirmed.</p>
        <p><b>Reference:</b> ${appReference}</p>
        <p><b>Total Amount:</b> ${data.total_price} ${data.currency}</p>
        <br>
        <p>Thank you for booking with us!</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${data.email}`);
    } catch (error) {
      console.error("Email failed to send:", error);
    }
  }

async cancelBooking(body: any) {
  const { app_reference } = body;

  // 1. Fetch booking with the correct plural column: cancellation_days
  const booking = await this.entityManager.query(
    `SELECT id, booking_status, travel_date, total_price, cancellation_days, cancellation_type, cancellation_fee
     FROM transfer_booking_details
     WHERE app_reference = ?`,
    [app_reference]
  );

  if (booking.length === 0)
    throw new BadRequestException("Booking reference not found.");

  const data = booking[0];

  // 2. State Check: Only 'CONFIRMED' or 'INITIATED' bookings can be cancelled
  if (data.booking_status === 'CANCELLED') {
    throw new ConflictException("This booking has already been cancelled.");
  }

  // 3. Date Calculation Logic (Calendar Days)
  const travelDate = new Date(data.travel_date);
  const today = new Date();

  // Normalize to midnight for accurate day-counting
  travelDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const timeDiff = travelDate.getTime() - today.getTime();
  const daysBeforeTravel = Math.ceil(timeDiff / (1000 * 3600 * 24));

  let penaltyAmount = 0;
  const totalPrice = parseFloat(data.total_price);
  const feeConfig = parseFloat(data.cancellation_fee);

  // 4. Apply Policy: If user cancels within the restricted window
  // Example: If cancellation_days is 2, and user is cancelling 1 day before.
  if (daysBeforeTravel <= data.cancellation_days) {
    if (data.cancellation_type === 'PERCENT') {
      penaltyAmount = (totalPrice * feeConfig) / 100;
    } else {
      // Flat Amount (e.g., 500 INR)
      penaltyAmount = feeConfig;
    }
  }

  // Ensure penalty doesn't exceed total price (safety check)
  if (penaltyAmount > totalPrice) penaltyAmount = totalPrice;

  const refundAmount = totalPrice - penaltyAmount;

  // 5. Update Database Record
  await this.entityManager.query(
    `UPDATE transfer_booking_details
     SET booking_status = 'CANCELLED', cancelled_at = NOW(), cancellation_fee = ?
     WHERE app_reference = ?`,
    [penaltyAmount, app_reference]
  );

  // 6. Return detailed breakdown for the API response
  return {
    status: 200,
    message: "Booking cancellation processed.",
    app_reference,
    policy_details: {
      days_remaining: daysBeforeTravel,
      policy_window: data.cancellation_days,
      is_penalty_applied: penaltyAmount > 0
    },
    financial_breakdown: {
      total_paid: totalPrice.toFixed(2),
      cancellation_penalty: penaltyAmount.toFixed(2),
      refund_amount: refundAmount.toFixed(2),
      currency: 'INR'
    }
  };
}


  }




