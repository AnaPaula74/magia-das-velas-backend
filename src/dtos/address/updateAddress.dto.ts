export interface UpdateAddressDTO {
  userId: number;
  street?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  zip?: string | undefined;
}
