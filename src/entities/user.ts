export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  phone?: string | null;
  created_at?: Date;
}