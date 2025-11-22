import type { DefaultSession } from "next-auth";
import type { JWT as BaseJWT } from "next-auth/jwt";
import type { Role } from "generated/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends BaseJWT {
    id: string;
    role: Role;
  }
}
