export class addVehicle {
  vehicle_type_id: number;
  vehicle_name_id: number;
  starting_point: string;
  ending_point: string;
  duration_hours: number;
  duration_minutes: number;
  return_trip: boolean;
  cancellation_type: 'PERCENT' | 'AMOUNT';
  cancellation_fee: number;
  cancellation_days: number;

  seasons: {
    start_date: string;
    end_date: string;
    base_price: number;
  }[];
}
