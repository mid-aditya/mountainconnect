import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { UserService } from "../user/user.service";
import { User } from "../user/user.entity";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { getAppConfig } from "../../config/app.config";
import axios from "axios";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const { email, phone, password, fullName } = registerDto;

    // Check if user exists
    if (email) {
      const existingEmail = await this.userService.findByEmail(email);
      if (existingEmail) {
        throw new ConflictException("Email already registered");
      }
    }

    if (phone) {
      const existingPhone = await this.userService.findByPhone(phone);
      if (existingPhone) {
        throw new ConflictException("Phone number already registered");
      }
    }

    if (!email && !phone) {
      throw new BadRequestException("Either email or phone is required");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const savedUser = await this.userService.createUser({
      email,
      phone,
      password: hashedPassword,
      fullName,
      roles: ["solo_traveler"],
    });
    const tokens = await this.generateTokens(savedUser);

    return { user: savedUser, tokens };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const { emailOrPhone, password } = loginDto;

    // Find user by email or phone
    let user = await this.userService.findByEmail(emailOrPhone);
    if (!user) {
      user = await this.userService.findByPhone(emailOrPhone);
    }

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check if user has password (social login users may not have password)
    if (!user.password) {
      throw new UnauthorizedException("Please login with social provider");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException("Account is deactivated");
    }

    // Update last login
    await this.userService.updateLastLogin(user.id);

    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async socialLogin(
    provider: "google" | "facebook" | "instagram",
    token: string,
  ): Promise<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    // Validate token with provider
    let socialEmail: string;
    let socialId: string;
    let avatar: string | undefined;

    switch (provider) {
      case "google":
        const googleUser = await this.validateGoogleToken(token);
        socialEmail = googleUser.email;
        socialId = googleUser.id;
        avatar = googleUser.picture;
        break;
      case "facebook":
        const facebookUser = await this.validateFacebookToken(token);
        socialEmail = facebookUser.email;
        socialId = facebookUser.id;
        avatar = facebookUser.picture?.url;
        break;
      case "instagram":
        const instagramUser = await this.validateInstagramToken(token);
        socialEmail = instagramUser.id + "@instagram.user";
        socialId = instagramUser.id;
        avatar = instagramUser.profile_picture;
        break;
    }

    // Create or link user
    const user = await this.userService.createOrLinkSocialUser(
      provider,
      socialId,
      socialEmail,
      socialEmail.split("@")[0], // Use email prefix as fullName
      avatar,
    );

    // Update last login
    await this.userService.updateLastLogin(user.id);

    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get("JWT_SECRET"),
      });

      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const user = await this.userService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException("User not found or inactive");
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  async verifyEmail(
    userId: string,
    otp: string,
  ): Promise<{ verified: boolean }> {
    // TODO: Implement OTP verification with Redis
    // For now, just mark as verified
    const user = await this.userService.findById(userId);
    user.emailVerified = true;
    await this.userService.saveUser(user);
    return { verified: true };
  }

  async verifyPhone(
    userId: string,
    otp: string,
  ): Promise<{ verified: boolean }> {
    // TODO: Implement OTP verification with Redis
    // For now, just mark as verified
    const user = await this.userService.findById(userId);
    user.phoneVerified = true;
    await this.userService.saveUser(user);
    return { verified: true };
  }

  async forgotPassword(emailOrPhone: string): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(emailOrPhone);
    const userByPhone = await this.userService.findByPhone(emailOrPhone);
    const userFound = user || userByPhone;

    if (!userFound) {
      // Don't reveal if user exists
      return { message: "If account exists, reset link has been sent" };
    }

    // TODO: Generate reset token and send via email/SMS
    // TODO: Store reset token in Redis with expiry

    return { message: "If account exists, reset link has been sent" };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // TODO: Validate reset token from Redis
    // TODO: Update password

    return { message: "Password has been reset successfully" };
  }

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.id, email: user.email, roles: user.roles };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get("JWT_EXPIRY", "15m"),
    });

    const refreshToken = this.jwtService.sign(
      { ...payload, type: "refresh" },
      { expiresIn: this.configService.get("JWT_REFRESH_EXPIRY", "7d") },
    );

    return { accessToken, refreshToken };
  }

  private async validateGoogleToken(
    token: string,
  ): Promise<{ id: string; email: string; picture?: string }> {
    // Verify with Google API
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  }

  private async validateFacebookToken(token: string): Promise<any> {
    const appConfig = getAppConfig(this.configService);
    const response = await axios.get(`https://graph.facebook.com/me`, {
      params: { fields: "id,email,picture", access_token: token },
    });
    return response.data;
  }

  private async validateInstagramToken(token: string): Promise<any> {
    // Instagram Basic Display API validation
    const response = await axios.get("https://graph.instagram.com/me", {
      params: { fields: "id,username,profile_picture", access_token: token },
    });
    return response.data;
  }

  async validateUser(payload: { sub: string }): Promise<User | null> {
    return this.userService.findById(payload.sub);
  }
}
