import { INestApplication, Logger } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserService } from "../modules/user/user.service";

const ADMIN_EMAIL = "admin@mountainconnect.id";
const ADMIN_PASSWORD = "Admin123!";
const ADMIN_NAME = "Admin MountainConnect";

export async function seedDefaultAdmin(app: INestApplication): Promise<void> {
  const logger = new Logger("SeedAdmin");
  const userService = app.get(UserService);

  const existing = await userService.findByEmail(ADMIN_EMAIL);
  if (existing) {
    if (!existing.roles?.includes("admin")) {
      existing.roles = [...(existing.roles || []), "admin"];
      await userService.saveUser(existing);
      logger.log(`Updated roles for ${ADMIN_EMAIL}`);
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await userService.createUser({
    email: ADMIN_EMAIL,
    password: hashedPassword,
    fullName: ADMIN_NAME,
    roles: ["admin"],
    emailVerified: true,
    isActive: true,
  });

  logger.log(`Created default admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}
