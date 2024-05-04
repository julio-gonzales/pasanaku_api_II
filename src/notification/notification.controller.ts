import { Controller, Post,Get, Param } from '@nestjs/common';
import { SendWhatsAppDto } from './dto/sendWhatsAppDto.dto';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    //Devuelve notificaciones de un jugador
    @Get(':id')
    notificaciones(@Param('id') id: number) {
    return this.notificationService.notificaciones(id);
    }
    
    @Post('send/:id')
    async sendPushNotification(@Param('id') id: number) {
          // Enviar firebasepush
      return this.notificationService.sendPushNotificationPrueba(id);
    }
      
    /*
    @Post('send/:id')
    async sendWhatsAppMessage(@Param('id') id: number) {
          // Enviar el mensaje de WhatsApp
      return this.notificationService.sendWhatsAppMessage(id);
    }
    */
  
    /*
    @Post('enviar/:id')
    sendInviteMail(@Param('id') id: number) {
      console.log('service');
      return this.notificationService.sendWhatsAppMessage(id);
    }
    */
 
}
