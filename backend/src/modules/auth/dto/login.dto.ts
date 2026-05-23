import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'User email or phone number' })
  @IsString()
  @MinLength(1, { message: 'Email or phone is required' })
  emailOrPhone: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}
