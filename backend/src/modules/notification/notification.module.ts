import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bullmq";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { Notification } from "./notification.entity";
import { SMSAdapter } from "../../adapters/sms.adapter";

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    BullModule.registerQueue({ name: "notifications" }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, SMSAdapter],
  exports: [NotificationService],
})
export class NotificationModule {}
