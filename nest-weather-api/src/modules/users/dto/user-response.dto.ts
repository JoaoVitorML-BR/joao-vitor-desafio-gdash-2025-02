export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: string;
  approved?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
