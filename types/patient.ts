export interface Patient {
  id: string | number;
  name: string;
  age: number;
  condition: string;
  email?: string;
  clinicId?: string;
}
