import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class GetNotificationsDto {
  @IsString()
  @IsNotEmpty()
  recipientId!: string;

  @IsString()
  @IsOptional()
  appId?: string;

  @IsInt()
  @IsOptional()
  limit?: number;

  @IsInt()
  @IsOptional()
  skip?: number;
}
