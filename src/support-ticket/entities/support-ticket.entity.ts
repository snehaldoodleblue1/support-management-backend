import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('support_tickets')
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  ticketId: string;

  @Column()
  ticketTitle: string;

  @Column()
  ticketType: string;

  @Column({ nullable: true })
  organization: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  priority: string;

  @Column({ default: false })
  reminder32Sent: boolean;

  @Column({ default: false })
  reminder48Sent: boolean;

  @Column({ default: false })
  reminder60Sent: boolean;

  @Column({ default: false })
  autoClosed: boolean;

  @Column({ nullable: true })
  slaDueAt: Date;

  @ManyToOne(() => User, { nullable: true })
  admin: User | null;

  @ManyToOne(() => User, { nullable: true })
  telesalesAdmin: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
