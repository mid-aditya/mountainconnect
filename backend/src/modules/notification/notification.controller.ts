import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Headers,
  ParseUUIDPipe,
} from "@nestjs/common";
import { NotificationService } from "./notification.service";

@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(@Headers("x-user-id") userId: string) {
    return this.notificationService.getUserNotifications(userId);
  }

  @Patch(":id/read")
  async markAsRead(@Param("id", ParseUUIDPipe) id: string) {
    await this.notificationService.markAsRead(id);
    return { success: true };
  }

  @Post("read-all")
  async markAllAsRead(@Headers("x-user-id") userId: string) {
    await this.notificationService.markAllAsRead(userId);
    return { success: true };
  }
}
