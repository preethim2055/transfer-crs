export class AutoCompleteDto {
  DestName: string;
}


export class SearchDto {
  destination: string;
  from: string;
  to: string;
  Currency: string;

  paxes: {
    adultCount: number;
    childCount: number;
    ChildAge: number[];
  }[];

  booking_source: string;
  UserType: string;
  UserId: number;
}



export class ProductDetailsDto {
  BookingSource: string;
  ResultToken: string;
}


export class TripListDto {
  booking_source: string;
  ResultToken: string;
}
