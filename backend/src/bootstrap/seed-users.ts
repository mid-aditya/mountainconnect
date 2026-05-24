import { INestApplication, Logger } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserService } from "../modules/user/user.service";

export const SEED_ACCOUNTS = {
  admin: {
    email: "admin@mountainconnect.id",
    password: "Admin123!",
    fullName: "Admin MountainConnect",
    roles: ["admin"],
  },
  user: {
    email: "user@mountainconnect.id",
    password: "User123!",
    fullName: "Ahmad Pendaki",
    roles: ["solo_traveler"],
  },
  operator: {
    email: "operator@mountainconnect.id",
    password: "Operator123!",
    fullName: "Sarah Trip Operator",
    roles: ["operator"],
  },
} as const;

async function upsertUser(
  userService: UserService,
  email: string,
  password: string,
  fullName: string,
  roles: string[],
): Promise<"created" | "updated" | "exists"> {
  const existing = await userService.findByEmail(email);
  if (existing) {
    let changed = false;
    for (const role of roles) {
      if (!existing.roles?.includes(role)) {
        existing.roles = [...(existing.roles || []), role];
        changed = true;
      }
    }
    if (changed) {
      await userService.saveUser(existing);
      return "updated";
    }
    return "exists";
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await userService.createUser({
    email,
    password: hashedPassword,
    fullName,
    roles,
    emailVerified: true,
    isActive: true,
  });
  return "created";
}

export async function seedDefaultUsers(app: INestApplication): Promise<void> {
  const logger = new Logger("SeedUsers");
  const userService = app.get(UserService);

  for (const [key, account] of Object.entries(SEED_ACCOUNTS)) {
    const result = await upsertUser(
      userService,
      account.email,
      account.password,
      account.fullName,
      [...account.roles],
    );
    if (result === "created") {
      logger.log(
        `Created ${key}: ${account.email} / ${account.password}`,
      );
    }
  }
}
