export interface Address {
  id: number;
  user_id: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  created_at?: Date;
}
