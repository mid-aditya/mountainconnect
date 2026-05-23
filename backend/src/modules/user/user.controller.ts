import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from './user.entity';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUser(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @Roles('admin', 'tn_admin', 'moderator')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    return this.userService.findAll(Number(page), Number(limit));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<User>,
    @CurrentUser() user: User,
  ): Promise<User> {
    // Users can only update their own profile unless admin
    if (user.id !== id && !user.roles.includes('admin') && !user.roles.includes('tn_admin')) {
      throw new Error('Cannot update another user\'s profile');
    }
    return this.userService.updateProfile(id, updateData);
  }

  @Post('verify-ktp')
  @ApiOperation({ summary: 'Verify user KTP (Indonesian ID)' })
  @Roles('tn_admin', 'moderator')
  async verifyKtp(
    @Body('userId', ParseUUIDPipe) userId: string,
  ): Promise<User> {
    return this.userService.verifyKtp(userId);
  }

  @Post('emergency-contact')
  @ApiOperation({ summary: 'Update emergency contact' })
  async updateEmergencyContact(
    @CurrentUser() user: User,
    @Body() contact: { name: string; relationship: string; phone: string; email?: string },
  ): Promise<User> {
    return this.userService.updateEmergencyContact(user.id, contact);
  }

  @Post('device-token')
  @ApiOperation({ summary: 'Register device token for push notifications' })
  async registerDeviceToken(
    @CurrentUser() user: User,
    @Body('token') token: string,
  ): Promise<User> {
    return this.userService.updateDeviceToken(user.id, token);
  }

  @Post('device-token/remove')
  @ApiOperation({ summary: 'Remove device token' })
  async removeDeviceToken(
    @CurrentUser() user: User,
    @Body('token') token: string,
  ): Promise<User> {
    return this.userService.removeDeviceToken(user.id, token);
  }
}
