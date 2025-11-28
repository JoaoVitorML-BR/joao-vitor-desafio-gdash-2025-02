import { UserDocument } from "src/modules/users/schemas/user.schema";

export interface PaginatedUsers {
  data: UserDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}