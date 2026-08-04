import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupportTicketDto {
  @ApiProperty({ example: 'PATHWAY-12345' })
  @IsString()
  @IsNotEmpty()
  ticketTitle: string;

  @ApiProperty({ example: 'POOL_CREATION_ISSUE' })
  @IsString()
  @IsNotEmpty()
  ticketType: string;

  @ApiProperty({ example: 'Talktalk' })
  @IsString()
  @IsOptional()
  organization?: string;

  @ApiProperty({ example: 'The ticket description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateCustomerTicketDto {
  @ApiProperty({ example: 'PATHWAY-12345' })
  @IsString()
  @IsNotEmpty()
  ticketTitle: string;

  @ApiProperty({ example: 'POOL_CREATION_ISSUE' })
  @IsString()
  @IsNotEmpty()
  ticketType: string;

  @ApiProperty({ example: 'My issue description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateSupportTicketMessageDto {
  @ApiProperty({ example: 'New message text' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class GetSupportTicketsDto {
  @ApiProperty({ example: 'OPEN', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: '1', required: false })
  @IsOptional()
  @IsString()
  page?: string;
}

export class ReopenTicketDto {
  @ApiProperty({ example: 'Ticket issue resolved' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ReopenCustomerTicketDto {
  @ApiProperty({ example: 'User provided more info' })
  @IsString()
  @IsOptional()
  reason?: string;
}
