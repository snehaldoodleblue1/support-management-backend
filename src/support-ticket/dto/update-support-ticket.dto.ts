import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { TicketStatus } from '../../constants';

export class UpdateSupportTicketDto {
  @ApiPropertyOptional({ example: 'IN_PROGRESS' })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({ example: 'High' })
  @IsOptional()
  @IsString()
  priority?: string;
}
