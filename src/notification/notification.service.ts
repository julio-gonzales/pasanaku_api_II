import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Twilio } from 'twilio';
import * as admin from 'firebase-admin';

import { Repository } from 'typeorm';
import { JugadoresService } from 'src/jugadores/jugadores.service';
import { Invitacion } from 'src/invitacion/entities/invitacion.entity';
import { Partida } from 'src/partida/entities/partida.entity';
import { Jugador } from 'src/jugadores/entities/jugador.entity';
import { Notificacion } from './entities/notificacion.entity';

import { SendWhatsAppDto } from './dto/sendWhatsAppDto.dto';
import { join } from 'path';

@Injectable()
export class NotificationService {
    private readonly client: Twilio;
    constructor(
        @InjectRepository( Invitacion ) private readonly invitacionRepository: Repository<Invitacion>, 
        @InjectRepository( Jugador ) private readonly jugadorRepository: Repository<Jugador>,
        @InjectRepository( Notificacion ) private readonly notificacionRepository: Repository<Notificacion>,  
        private readonly jugadoresService: JugadoresService,
    ) {       
      const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      const accountSid = process.env.TWI_SID;
      const authToken = process.env.TWI_AUT;
        this.client = require('twilio')(accountSid, authToken);
      }
      

      
      async sendWhatsAppMessage(nombre: string,invitacion: Invitacion,partida: Partida): Promise<any> {
        try {
          const mediaUrl = ['https://i.ibb.co/cY3nmWx/qr.png'];
          const body = `Hola ${invitacion.nombre}.` + 
          `A sido invitado a la partida ${partida.nombre}, con un monto de ${partida.pozo}\n` + 
          `por el jugador ${nombre}\n\n` + 
          `La partida empieza el ${partida.fechaInicio}\n`;
  
          const from = 'whatsapp:+14155238886';
          const to = `whatsapp:+591${invitacion.telefono}`;

          const message = await this.client.messages.create({ body, from, to, mediaUrl});

          console.log('Mensage enviado correctamente a ' + invitacion.nombre);
          return 'success';
  
          } catch (error) {
            console.error('Error al enviar el mensaje de WhatsApp:', error);
            throw error;
          }
      }

      async sendPushNotificationPrueba (id: number): Promise<any> {
        const jugador = await this.jugadorRepository.findOne({
          where: { id: id }
        });        
        const message = {
          notification: {
            title: "Nueva oferta",
            body: "Hay una nueva oferta disponible, toca para verla.",
          },          
          token: jugador.tokenMovil,
        };    
        try {
          const response = await admin.messaging().send(message);
          console.log('Successfully sent message:', response);
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }

      //Crea notificaciones
      async create (jugador: Jugador, title: string, body : string): Promise<any>{
          var fecha = new Date();
          var fechaS = fecha.toLocaleString();
          const notificacion = this.notificacionRepository.create({ 
            title: title,
            body: body,
            fecha: fechaS,
            jugador:jugador
          }); 
          await this.notificacionRepository.save(notificacion);
      }

      //Devuelve notificaciones de un jugador
      async notificaciones(id: number) {
        const notificaciones = await this.notificacionRepository.find({
          where: {
            jugador: { id: id },
          },
          order: {
            fecha: 'DESC', 
          },
        });
      
        return notificaciones;
      }


      async sendPushNotificationIndividual(jugador: Jugador, title: string, body : string): Promise<any> { 
        if(jugador.tokenMovil != null){
          const message = {
            notification: {
              title: title,
              body: body,
            },          
            token: jugador.tokenMovil,
          };    
          try {
            const response = await admin.messaging().send(message);
            console.log('Successfully sent message:', response);
          } catch (error) {
            console.error('Error sending message:', error);
          }
        }
        await this.create(jugador,title,body);
      }

      

      //Recibe id de la partida
      async sendPushNotification(id: number, title: string, body : string): Promise<any> {         
          var jugadores: Jugador[] = await this.jugadoresService.jugadores(id);
          var tokens: string[] = [];
          for (const jugador of jugadores) {
              if(jugador.tokenMovil != null){
                tokens.push(jugador.tokenMovil);
              }
          }        
      
          const message = {
            notification: {
              title: title,
              body: body,
            },          
            tokens: tokens,
          };    
          try {
              const response = await admin.messaging().sendMulticast(message);
              console.log('Successfully sent message:', response);
            } catch (error) {
              console.error('Error sending message:', error);
          }     
             
          //Guardaa notificaciones
          for (const jugador of jugadores) {
            await this.create(jugador,title,body);
          }

      }

































      /*
      //Prueba Twillio
      async sendWhatsAppMessage(id: number): Promise<any> {
        try {
            const  nombre = "juan";
            const body = `Hola ${nombre}, gracias por registrarte con el email..\n\n` + 
            `En este momento solo puedo enviar con el numero que te asigna twilio, todavia estoy viendo lo de Meta Bussiness:\n`;
            const from = 'whatsapp:+14155238886';
            const to = `whatsapp:+59170872473`;

            const message = await this.client.messages.create({ body, from, to });
          
             return message;
         } catch (error) {
          console.error('Error al enviar el mensaje de WhatsApp:', error);
          throw error;
        }
      } 
      */
     
    /*
    //Pruebaa envio directo
      async sendWhatsAppMessage(id: number): Promise<any> {
      try {
        console.log('service');
        const invitado = await this.invitacionRepository.find({
          where: { id: id },
          relations: ['participante', 'participante.jugador'],
          select: ['id', 'nombre', 'telefono', 'email', 'estado', 'partidaId'],
          }); 
          console.log(invitado[0].participante.jugador.nombre);

          const nombre = invitado[0].participante.jugador.nombre;
          const partida = invitado[0].participante.partida;

          const body = `Hola ${invitado[0].nombre}..\n\n` + 
          `A sido invitado a la partida ${partida.nombre}, con un monto de ${partida.pozo}\n` + 
          `por el jugador ${nombre}\n\n` + 
          `La partida empieza el ${partida.fechaInicio}\n`;

          const from = 'whatsapp:+14155238886';
          const to = `whatsapp:+591${invitado[0].telefono}`;
          const message = await this.client.messages.create({ body, from, to });
          return invitado;

        } catch (error) {
          console.error('Error al enviar el mensaje de WhatsApp:', error);
          throw error;
        }
    }
    */
   

    
}
