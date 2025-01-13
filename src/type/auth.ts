import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

export interface JWT extends DefaultJWT {
  id?: number;
}

export interface Session extends DefaultSession {
  user: {
    id: string;
    email: string;
  };
}
