import { Role } from '@prisma/client';

export type User = {
  id: number;
  name: string;
  role: Role;
  is_delete: boolean;
  createdAt: Date;
  updatedAt: Date;
};
