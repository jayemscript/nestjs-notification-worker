import { IsString, IsNotEmpty, Min, IsInt } from 'class-validator';

export class ActionDto {
  @IsString()
  @IsNotEmpty()
  notifId!: string;
}

export class IgnoreDto extends ActionDto {
  @IsInt()
  @Min(1)
  ignoreMinutes!: 5 | 10 | 30 | 60;
}
