export interface UsersModificationResultDto {
  hasChanges: boolean;
  modifiedCount: number;
  users: User[];
}

export interface User {
  id: number;
  name: string;
  ws_Id: string;
  messages: Message[];
}

export interface Message {
  id: number;
  userId: number;
  number: string;
  text?: string;
  imageUrl?: string;
  paymentStatus?: {
    id: number;
    name: string;
  };
}