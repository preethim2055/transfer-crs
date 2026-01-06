export class UpdateRouteDto {
  route_id: number; // SupplierVehicle ID
  starting_point?: string;
  ending_point?: string;
  duration_hours?: number;
  duration_minutes?: number;
  return_trip?: boolean;
  cancellation_type?: 'PERCENT' | 'AMOUNT';
  cancellation_fee?: number;
  cancellation_days?: number;
}

export class UpdateSeasonDto {
  route_id: number; // SupplierVehicle ID
  seasons: {
    id?: number; // Optional if updating existing season
    start_date: string;
    end_date: string;
    base_price: number;
  }[];
}
