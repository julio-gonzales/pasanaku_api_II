import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';


import { JugadoresModule } from './jugadores/jugadores.module';
import { BancoModule } from './banco/banco.module';
import { CuentaModule } from './cuenta/cuenta.module';
import { PartidaModule } from './partida/partida.module';
import { MonedaModule } from './moneda/moneda.module';
import { ParticipanteModule } from './participante/participante.module';
import { RolesModule } from './roles/roles.module';
import { CustomExceptionFilter } from './filters/custom-exception.filter';
import { NotificationModule } from './notification/notification.module';
import { InvitacionModule } from './invitacion/invitacion.module';
import { MailModule } from './mail/mail.module';
import { RondaModule } from './ronda/ronda.module';
import { SubastaModule } from './subasta/subasta.module';
import { OfertaModule } from './oferta/oferta.module';
import { TransferenciaModule } from './transferencia/transferencia.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets'),
      serveRoot: '/assets', 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
      // host: process.env.POSTGRES_HOST,
      // port: +process.env.POSTGRES_PORT,
      // database: process.env.POSTGRES_DATABASE,
      // username: process.env.POSTGRES_USERNAME,
      // password: process.env.POSTGRES_PASSWORD,
        entities: ['dist/src/**/*.entity{.ts,.js}'],
        autoLoadEntities: true, // Carga automaticamente las entidades
        synchronize: true,  // Realiza las migraciones automaticamente
        ssl: true,
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        }
      }),
     }),
    JugadoresModule,
    BancoModule,
    CuentaModule,
    PartidaModule,
    MonedaModule,
    ParticipanteModule,
    RolesModule,
    NotificationModule,
    InvitacionModule,
    MailModule,
    RondaModule,
    SubastaModule,
    OfertaModule,
    TransferenciaModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
  ],
})
export class AppModule {}