export interface User {
  lineUserId: string;
  fullName: string;
  phone: string;
  email?: string;
  lineDisplayName?: string;
  linePictureUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserFormData {
  fullName: string;
  phone: string;
  email?: string;
}
