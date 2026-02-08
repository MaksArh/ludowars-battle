export interface User {
  id: string;
  username: string;
  coins: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  username: string;
}



