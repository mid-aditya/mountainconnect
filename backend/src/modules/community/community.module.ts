import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityService } from './community.service';
import { ForumCategory, ForumThread, ForumPost } from './community.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ForumCategory, ForumThread, ForumPost])],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
