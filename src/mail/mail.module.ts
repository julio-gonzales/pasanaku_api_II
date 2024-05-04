import { Module } from '@nestjs/common';

import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';


import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitacion } from 'src/invitacion/entities/invitacion.entity';
import { Participante } from 'src/participante/entities/participante.entity';
import { Partida } from 'src/partida/entities/partida.entity';
@Module({
  controllers: [MailController],
  providers: [MailService],
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () =>({
          transport: {
            host: process.env.MAIL_HOST,
            secure: false,
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASSWORD,
            },
          },
          defaults: {
            from: `"No Reply" <${process.env.MAIL_USER}>`,
          },
          template: {
            dir: join(__dirname, 'templates'), 
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
      }),
    }),
    TypeOrmModule.forFeature([Invitacion, Participante, Partida ]),
  ],
  exports: [MailService],
})
export class MailModule {}
