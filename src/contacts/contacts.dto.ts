export class IdentityDto {
  phoneNumber?: string;
  email?: string;
}

export class IdentityResponseDto {
  primaryContactId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}
