import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  User,
  VerificationLevel,
  Badge,
  EmergencyContact,
} from "./user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone } });
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return { data, total, page, limit };
  }

  async updateProfile(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);

    const allowedFields = ["fullName", "avatar", "medicalInfo", "skills"];
    const updates: Partial<User> = {};

    for (const field of allowedFields) {
      if (updateData[field as keyof User] !== undefined) {
        (updates as any)[field] = updateData[field as keyof User];
      }
    }

    await this.userRepository.update(id, updates);
    return this.findById(id);
  }

  async updateVerificationLevel(
    id: string,
    level: VerificationLevel,
  ): Promise<User> {
    const user = await this.findById(id);

    if (
      level < VerificationLevel.LEVEL_1_BASIC ||
      level > VerificationLevel.LEVEL_3_FULLY_VERIFIED
    ) {
      throw new BadRequestException("Invalid verification level");
    }

    user.verificationLevel = level;
    return this.userRepository.save(user);
  }

  async verifyKtp(id: string): Promise<User> {
    const user = await this.findById(id);
    user.ktpVerified = true;
    await this.updateVerificationLevel(id, VerificationLevel.LEVEL_2_VERIFIED);
    return this.userRepository.save(user);
  }

  async addBadge(userId: string, badge: Badge): Promise<User> {
    const user = await this.findById(userId);

    const existingBadge = user.badges.find((b) => b.id === badge.id);
    if (existingBadge) {
      throw new BadRequestException("Badge already earned");
    }

    user.badges.push(badge);
    return this.userRepository.save(user);
  }

  async updateEmergencyContact(
    userId: string,
    contact: EmergencyContact,
  ): Promise<User> {
    const user = await this.findById(userId);
    user.emergencyContact = contact;
    return this.userRepository.save(user);
  }

  async updateDeviceToken(userId: string, token: string): Promise<User> {
    const user = await this.findById(userId);

    if (!user.deviceTokens) {
      user.deviceTokens = [];
    }

    if (!user.deviceTokens.includes(token)) {
      user.deviceTokens.push(token);
    }

    return this.userRepository.save(user);
  }

  async removeDeviceToken(userId: string, token: string): Promise<User> {
    const user = await this.findById(userId);

    if (user.deviceTokens) {
      user.deviceTokens = user.deviceTokens.filter((t) => t !== token);
    }

    return this.userRepository.save(user);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastLogin: new Date() });
  }

  async softDelete(userId: string): Promise<void> {
    const user = await this.findById(userId);
    await this.userRepository.softRemove(user);
  }

  async restore(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.userRepository.restore(userId);
    return this.findById(userId);
  }

  async createUser(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async findBySocialProvider(
    provider: string,
    socialId: string,
  ): Promise<User | null> {
    return this.userRepository.findOne({
      where: { socialProvider: provider, socialId },
    });
  }

  async createOrLinkSocialUser(
    provider: string,
    socialId: string,
    email: string,
    fullName: string,
    avatar?: string,
  ): Promise<User> {
    let user = await this.findBySocialProvider(provider, socialId);

    if (user) {
      // Update avatar if provided
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        await this.userRepository.save(user);
      }
      return user;
    }

    // Check if user exists with same email
    user = await this.findByEmail(email);
    if (user) {
      // Link social account to existing user
      user.socialProvider = provider;
      user.socialId = socialId;
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
      return this.userRepository.save(user);
    }

    // Create new user
    user = this.userRepository.create({
      email,
      fullName,
      avatar,
      socialProvider: provider,
      socialId,
      emailVerified: true,
      roles: ["solo_traveler"],
    });

    return this.userRepository.save(user);
  }
}
