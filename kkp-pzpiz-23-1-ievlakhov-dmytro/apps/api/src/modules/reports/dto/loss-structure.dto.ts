import { IsDateString } from 'class-validator';

export class LossStructureQueryDto {
  @IsDateString() from: string;
  @IsDateString() to: string;
}
