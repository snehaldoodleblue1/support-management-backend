import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Query, BadRequestException, UploadedFile, UploadedFiles, ParseFilePipe, UseInterceptors, Res, MaxFileSizeValidator } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../common/guard/auth.guard';
import type { AuthenticatedRequest } from '../auth/interface/auth-request.interface';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProductTypeTicketTypes, productType } from 'src/constants';
import type { ProductType } from 'src/constants';
import type { Response } from 'express';
import { AssignTelesatAdminDto } from './dto/assign-telesat-admin.dto';
import { SupportTicketService } from './support-ticket.service';
import { CreateCustomerTicketDto, CreateSupportTicketDto, CreateSupportTicketMessageDto, GetSupportTicketsDto, ReopenCustomerTicketDto, ReopenTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('support-ticket')
@Controller(['pathway-api/support-ticket', 'pathway-portal/support-ticket'])
export class SupportTicketController {
  constructor(private readonly supportTicketService: SupportTicketService) {}

  @Post()
  @ApiOperation({ summary: 'Create support ticket' })
  @ApiResponse({ status: 201, description: 'Support ticket created successfully' })
  async createTicket(
    @Body() createSupportTicketDto: CreateSupportTicketDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.supportTicketService.createTicket(createSupportTicketDto, req);
  }

  @Get()
  @ApiOperation({ summary: 'Get support tickets' })
  @ApiResponse({ status: 200, description: 'Support tickets fetched successfully' })
  async getTickets(@Query() query: GetSupportTicketsDto, @Req() req: AuthenticatedRequest) {
    return this.supportTicketService.getTickets(query, req.user);
  }

  @Get('/customersupportchat')
  @ApiOperation({ summary: 'Get customer support tickets' })
  @ApiResponse({ status: 200, description: 'Support tickets fetched successfully' })
  async getCustomerTickets(@Req() req: AuthenticatedRequest, @Query() query: GetSupportTicketsDto) {
    return this.supportTicketService.getCustomerTickets(query, req.user);
  }

  @Get('telesat-admins')
  @ApiOperation({ summary: 'Get Telesat Admin Users' })
  async getTelesatAdmins(@Req() req: AuthenticatedRequest) {
    return this.supportTicketService.getTelesatAdmins(req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get support ticket by id' })
  async getTicketById(@Param('id') id: string) {
    return this.supportTicketService.getTicketById(id);
  }

  @Patch('assign-telesat-admin')
  @ApiOperation({ summary: 'Assign Telesat Admin to tickets' })
  assignTelesatAdmin(@Body() dto: AssignTelesatAdminDto, @Req() req: AuthenticatedRequest) {
    return this.supportTicketService.assignTelesatAdmin(dto, req);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ticket status or priority' })
  async updateTicket(@Param('id') id: string, @Body() dto: UpdateSupportTicketDto, @Req() req: AuthenticatedRequest) {
    return this.supportTicketService.updateTicket(id, dto, req);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file to Azure Blob Storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024,
          }),
        ],
        exceptionFactory: () => new BadRequestException('File size should not exceed 10MB'),
      }),
    )
    file: any,
  ) {
    const fileUrl = await this.supportTicketService.uploadFile(file);

    return {
      success: true,
      message: 'File uploaded successfully',
      fileName: file.originalname,
      url: fileUrl,
    };
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Upload multiple files to Azure Blob Storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  async uploadFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024,
          }),
        ],
        exceptionFactory: () => new BadRequestException('File size should not exceed 10MB per file'),
      }),
    )
    files: any[],
  ) {
    const uploadedFiles = await this.supportTicketService.uploadFiles(files);

    return {
      success: true,
      message: 'Files uploaded successfully',
      files: uploadedFiles,
      urls: uploadedFiles.map((f) => f.url),
    };
  }

  @Post('/reopen')
  @ApiOperation({ summary: 'Reopen support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket reopened successfully' })
  reopenTicket(@Body() dto: ReopenTicketDto, @Req() req: AuthenticatedRequest) {
    return this.supportTicketService.reopenTicket(dto, req);
  }

  @Post('/customer/reopen/:ticketId')
  @ApiOperation({ summary: 'Reopen customer ticket' })
  @ApiResponse({ status: 201, description: 'Ticket reopened successfully' })
  async reopenCustomerTicket(@Param('ticketId') ticketId: string, @Body() dto: ReopenCustomerTicketDto, @Req() req: AuthenticatedRequest) {
    return this.supportTicketService.reopenCustomerTicket(ticketId, dto, req.user);
  }

  @Get(':ticketId/messages')
  @ApiOperation({ summary: 'Get support ticket messages' })
  @ApiParam({ name: 'ticketId', description: 'Support Ticket Id' })
  @ApiResponse({ status: 200, description: 'Messages fetched successfully' })
  async getMessages(@Param('ticketId') ticketId: string, @Query('search') search?: string) {
    return this.supportTicketService.getMessages(ticketId, search);
  }

  @Post(':ticketId/messages')
  @ApiOperation({ summary: 'Send message to support ticket' })
  @ApiParam({ name: 'ticketId', description: 'Support Ticket Id' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async createMessage(
    @Param('ticketId') ticketId: string,
    @Body() dto: CreateSupportTicketMessageDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.supportTicketService.createMessage(ticketId, dto, req.user);
  }

  @Post('/customer')
  @ApiOperation({ summary: 'Create customer support ticket' })
  @ApiResponse({ status: 201, description: 'Support ticket created successfully' })
  async createCustomerTicket(@Body() dto: CreateCustomerTicketDto, @Req() req: AuthenticatedRequest) {
    return this.supportTicketService.createCustomerTicket(dto, req.user);
  }

  @Get('ticket-types/:productType')
  getTicketTypes(@Param('productType') productType: ProductType) {
    return ProductTypeTicketTypes[productType] || [];
  }

  @Get('products/:productType/:organizationId')
  async getProductsByType(@Param('productType') productType: ProductType, @Param('organizationId') organizationId: string) {
    return this.supportTicketService.getProductsByType(productType, organizationId);
  }

  @Get('support-tickets/export')
  @ApiOperation({ summary: 'Export Support Tickets', description: 'Export Support Tickets In Excel File' })
  async exportSupportTickets(@Query() query: GetSupportTicketsDto, @Req() req: AuthenticatedRequest, @Res() res: Response) {
    const buffer = await this.supportTicketService.getTickets(query, req.user, true);

    if (!Buffer.isBuffer(buffer)) {
      const statusCode = typeof (buffer as unknown as { statusCode?: unknown })?.statusCode === 'number' ? (buffer as unknown as { statusCode: number }).statusCode : 500;
      return res.status(statusCode).send(buffer);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="SupportTickets.xlsx"');
    res.setHeader('Content-Length', buffer.length);

    return res.send(buffer);
  }

  @Get('organization-admins/:organizationId')
  @ApiOperation({ summary: 'Get admins of an organization' })
  @ApiResponse({ status: 200, description: 'Admins fetched successfully' })
  async getOrganizationAdmins(@Param('organizationId') organizationId: string, @Req() req: AuthenticatedRequest) {
    return this.supportTicketService.getOrganizationAdmins(organizationId, req);
  }

  @Get('organization-parentorganization-admins/:organizationId')
  @ApiOperation({ summary: 'Get admins of an organization' })
  @ApiResponse({ status: 200, description: 'Admins fetched successfully' })
  async getParentOrganizationAdmins(@Param('organizationId') organizationId: string, @Req() req: AuthenticatedRequest) {
    return this.supportTicketService.getParentOrganizationAdmins(organizationId, req);
  }
}
