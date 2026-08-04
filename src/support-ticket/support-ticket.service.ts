import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from './entities/support-ticket.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SupportTicketService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly supportTicketRepository: Repository<SupportTicket>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createTicket(createSupportTicketDto: any, req: any) {
    const ticket = this.supportTicketRepository.create({
      ticketId: `TICKET-${Date.now()}`,
      ticketTitle: createSupportTicketDto.ticketTitle,
      ticketType: createSupportTicketDto.ticketType,
      organization: createSupportTicketDto.organization,
      description: createSupportTicketDto.description,
      status: 'OPEN',
      priority: createSupportTicketDto.priority || 'Normal',
    });

    if (req?.user?.id) {
      const user = await this.userRepository.findOne({ where: { id: req.user.id } });
      if (user) {
        ticket.admin = user;
      }
    }

    return this.supportTicketRepository.save(ticket);
  }

  async getTickets(query: any, user: any, exportExcel = false) {
    const qb = this.supportTicketRepository.createQueryBuilder('ticket');

    if (query?.status) {
      qb.andWhere('ticket.status = :status', { status: query.status });
    }

    if (query?.ticketType) {
      qb.andWhere('ticket.ticketType = :ticketType', { ticketType: query.ticketType });
    }

    if (query?.search) {
      const search = `%${query.search.trim()}%`;
      qb.andWhere(
        '(ticket.ticketTitle LIKE :search OR ticket.description LIKE :search OR ticket.organization LIKE :search OR ticket.ticketId LIKE :search OR ticket.ticketType LIKE :search)',
        { search },
      );
    }

    qb.leftJoinAndSelect('ticket.admin', 'admin');
    qb.orderBy('ticket.createdAt', 'DESC');

    return qb.getMany();
  }

  async getCustomerTickets(query: any, user: any) {
    const qb = this.supportTicketRepository.createQueryBuilder('ticket');
    qb.leftJoinAndSelect('ticket.admin', 'admin');

    if (user?.id) {
      qb.andWhere('ticket.adminId = :adminId', { adminId: user.id });
    }

    return qb.getMany();
  }

  async getTelesatAdmins(req: any) {
    return this.userRepository.find({ where: { role: 'telesales' } });
  }

  async getTicketById(id: string) {
    return this.supportTicketRepository.findOne({
      where: { id },
      relations: { admin: true, telesalesAdmin: true },
    });
  }

  async assignTelesatAdmin(dto: any, req: any) {
    const ticket = await this.supportTicketRepository.findOne({ where: { ticketId: dto.ticketId } });
    if (!ticket) {
      return { message: 'Ticket not found' };
    }

    if (dto.email) {
      const user = await this.userRepository.findOne({ where: { email: dto.email } });
      ticket.telesalesAdmin = (user as User) || null;
      return this.supportTicketRepository.save(ticket);
    }

    return { message: 'No telesales admin email provided' };
  }

  async updateTicket(id: string, dto: any, req: any) {
    const ticket = await this.supportTicketRepository.findOne({ where: { id } });
    if (!ticket) {
      return null;
    }

    Object.assign(ticket, dto);
    return this.supportTicketRepository.save(ticket);
  }

  async uploadFile(file: any) {
    return `https://example.com/${file.originalname}`;
  }

  async uploadFiles(files: any[]) {
    return files.map((file) => ({ fileName: file.originalname, url: `https://example.com/${file.originalname}` }));
  }

  async reopenTicket(dto: any, req: any) {
    return { message: 'Ticket reopened', dto };
  }

  async reopenCustomerTicket(ticketId: string, dto: any, user: any) {
    return { ticketId, dto };
  }

  async getMessages(ticketId: string, search?: string) {
    return [];
  }

  async createMessage(ticketId: string, dto: any, user: any) {
    return { ticketId, dto };
  }

  async createCustomerTicket(dto: any, user: any) {
    return { message: 'Customer ticket created', dto };
  }

  async getProductsByType(ProductType: string, organizationId: string) {
    return [];
  }

  async getOrganizationAdmins(organizationId: string, req: any) {
    return [];
  }

  async getParentOrganizationAdmins(organizationId: string, req: any) {
    return [];
  }
}
