import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { readdirSync } from 'fs';
import { join } from 'path';
import { CreateEmailDto } from './dto/create-invitacion.dto';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  /*
  @Post()
  sendInviteMail(@Body() createEmailDto: CreateEmailDto) {
    return this.mailService.sendInviteMail(createEmailDto);
  }
  */
 
}

