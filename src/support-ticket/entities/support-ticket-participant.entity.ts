import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { SupportTicket } from './support-ticket.entity';
import { User } from '../../users/entities/user.entity';

@Entity('support_ticket_participants')
export class SupportTicketParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SupportTicket, { nullable: false })
  ticket: SupportTicket;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @CreateDateColumn()
  joinedAt: Date;
}
