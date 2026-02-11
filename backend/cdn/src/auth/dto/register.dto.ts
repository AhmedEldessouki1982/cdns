import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';

// Define UserRoles enum to match Prisma schema
export enum UserRoles {
  USER = 'USER',
  MANAGER = 'MANAGER',
}

export class RegisterDto {
  //name
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name: string;

  //password
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
  password: string;

  //email
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  email: string;

  //mobile
  @IsNotEmpty({ message: 'Mobile number is required' })
  @IsString({ message: 'Mobile must be a string' })
  @Matches(/^\+971(50|52|54|55|56|58)\d{7}$/, {
    message: 'Please provide a valid UAE mobile number (e.g., +971501234567)',
  })
  mobile: string;

  // //role admin | user
  @IsOptional()
  @IsEnum(UserRoles, { message: 'Role must be either USER or MANAGER' })
  role?: UserRoles;
}
