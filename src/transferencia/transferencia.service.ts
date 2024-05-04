import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { addMinutes } from 'date-fns/addMinutes';
import { cancelJob, scheduleJob,scheduledJobs,Job } from 'node-schedule';

import { JugadoresService } from 'src/jugadores/jugadores.service';

import { Participante } from 'src/participante/entities/participante.entity';
import { Transferencia } from './entities/transferencia.entity';
import { Ronda } from 'src/ronda/entities/ronda.entity';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class TransferenciaService {
    private readonly logger = new Logger('TransferenciaService') 

    constructor( 
        @InjectRepository( Ronda ) private readonly rondaRepository: Repository<Ronda>,
        @InjectRepository( Participante ) private readonly participanteRepository: Repository<Participante>, 
        @InjectRepository( Transferencia ) private readonly transferenciaRepository: Repository<Transferencia>,
        private readonly jugadoresService: JugadoresService,
        private readonly notificationService: NotificationService,
    ) { }

    async create (ganador: Participante, deudor: Participante, ronda: Ronda): Promise<any>{
        var fecha = new Date();
        var fecha = addMinutes(fecha, 2);
        const transaccion = this.transferenciaRepository.create({ 
          monto: deudor.cuota,
          contador: 0,
          fecha: fecha,
          estado: 'Debe',
          ronda: ronda,
          deudor: deudor,
          receptor: ganador,
        }); 
        await this.transferenciaRepository.save(transaccion);

        const fechaa = new Date(transaccion.fecha);
        const jobName = `Trans-${transaccion.id}`
          scheduleJob(jobName,fechaa, () => {
            this.penalizacion(transaccion.id);
        });

    }

    async penalizacion(id: number) {
      console.log(id);
      const transferencia = await this.transferenciaRepository.findOne({
          where: { id: id },
          relations: ['ronda.partida','deudor.jugador'],
        });      
        
      if( transferencia.estado == 'Debe' && transferencia.contador < 2){
        transferencia.monto = transferencia.monto * 1.10; 
        transferencia.fecha = addMinutes(transferencia.fecha, 2);
        transferencia.contador = transferencia.contador + 1; 
        await this.transferenciaRepository.save(transferencia);

        // Cancelar la tarea existente
        const jobName = `Trans-${id}`;
        try {
          cancelJob(jobName);
        } catch (error) {
          console.error(`Error al cancelar el trabajo: ${error.message}`);
        }
        const fechaa = new Date(transferencia.fecha);
        scheduleJob(jobName, fechaa, () => {
          this.penalizacion(id);
        });

        var title = "Penalizacion Aplicada";
        var body = `Tu nuevo monto a pagar de la partida ${transferencia.ronda.partida.nombre} ${transferencia.ronda.nombre} es ${transferencia.monto} .`;
        await this.notificationService.sendPushNotificationIndividual(transferencia.deudor.jugador,title,body);
      }  
      
    }

    //Devuelve transferencias de un jugador
    async transferencias(id: number, req: Request) {
        const transferencias = await this.transferenciaRepository.find({ 
          where: {
            deudor: { jugador: { id: id } },
          },
          relations: ['ronda.partida','deudor.jugador','receptor.jugador'],
        });   
        const transferenciasSimples = await Promise.all(transferencias.map(async (transferencia) => ({          
          id: transferencia.id,
          monto: transferencia.monto,
          fecha: transferencia.fecha,
          estado: transferencia.estado,
          partida: transferencia.ronda.partida.nombre,
          ronda: transferencia.ronda.nombre,
          deudor: {
            id: transferencia.deudor.jugador.id,
            nombre: transferencia.deudor.jugador.nombre,
          },
          receptor: {
            id: transferencia.receptor.jugador.id,
            nombre: transferencia.receptor.jugador.nombre,
            imagen : await this.jugadoresService.obtenerImagen(transferencia.receptor.jugador.id,req),
          },
        })));
      return transferenciasSimples;
    }
    

    async pagar(id: number) {
      const transferencia = await this.transferenciaRepository.findOne({
          where: { id: id },
          relations: ['ronda.partida','deudor.jugador','receptor.jugador'],
        });            
      transferencia.estado = 'Pagada';
      await this.transferenciaRepository.save(transferencia);  

      var title = "Pago Recibido";
      var body = `El jugador ${transferencia.deudor.jugador.nombre} te a realizado una transferencia .`;
      await this.notificationService.sendPushNotificationIndividual(transferencia.receptor.jugador,title,body); 


      return 'Pagada';
    }


    

}
