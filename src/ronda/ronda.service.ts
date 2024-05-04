import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { addMinutes, addWeeks, addMonths  } from 'date-fns';
import { scheduledJobs, scheduleJob } from 'node-schedule';
import { fromZonedTime, toZonedTime   } from 'date-fns-tz';


import { LessThan, Repository } from 'typeorm';
import { Partida } from 'src/partida/entities/partida.entity';
import { Ronda } from './entities/ronda.entity';
import { SubastaService } from 'src/subasta/subasta.service';
import { NotificationService } from 'src/notification/notification.service';


@Injectable()
export class RondaService {

    constructor(
        @InjectRepository( Ronda ) private readonly rondaRepository: Repository<Ronda>,
        private readonly subastaService: SubastaService,
        private readonly notificationService: NotificationService,
    ) {}

    async create(partida: Partida){
        var fechaInicio = partida.fechaInicio;
        var lapso = partida.lapso;
        
        for (let index = 0; index < partida.participantes; index++) {
          const ronda = this.rondaRepository.create({
              nombre: `Ronda ${index + 1}`, 
              fechaInicio,
              estado: 'Espera',
              partida,
          });
          await this.rondaRepository.save(ronda);
          fechaInicio = addMinutes(fechaInicio, 10);
          //fechaInicio = this.calcularFechaSiguiente(fechaInicio,lapso);          
          await this.subastaService.create(ronda);

          if(index == 0){
            var id = ronda.id;
          }else{
            const fechaa = new Date(ronda.fechaInicio);
            const jobName = `ronda-${ronda.id}`
            scheduleJob(jobName, fechaa, () => {
                this.iniciarRonda(ronda.id);
            });
          }
        }
        await this.iniciarRonda(id);
    }


    private calcularFechaSiguiente(fechaInicio: Date, lapso: string): Date {
        switch (lapso) {
          case 'Semanal':
            return addWeeks(fechaInicio, 1);
          case 'Bisemanal':
            return addWeeks(fechaInicio, 2);
          case 'Mensual':
            return addMonths(fechaInicio, 1);
          default:
            throw new Error(`Lapso desconocido: ${lapso}`);
        }
    }


    async iniciarRonda(id: number) {
      const ronda = await this.rondaRepository.findOne({
          relations: ['subasta','partida'],
          where: { id: id },
      }); 
      if ( !ronda ) {
          throw new NotFoundException(`La partida con el id ${ id } no fue encontrado.`)
      }  
      const partida = ronda.partida;

      const rondaAnterior = await this.rondaRepository.findOne({
        where: { 
          partida: { 
            id: partida.id 
          }, 
          fechaInicio: LessThan(ronda.fechaInicio) },
        order: { fechaInicio: 'DESC' },
      });

      //Busco si hay partida anterior para finalizar
      if (rondaAnterior && rondaAnterior.estado !== 'Finalizada') {
        rondaAnterior.estado = 'Finalizada';
        await this.rondaRepository.save(rondaAnterior);
        console.log(`Ronda anterior con ID ${rondaAnterior.id} ha sido finalizada.`);

        var title = "Ronda Inciada";
        const body = `La ${ronda.nombre} ha comenzado.\n La subasta empieza en 2 minutos`;
        await this.notificationService.sendPushNotification(partida.id,title,body);

      }
    
      ronda.estado = 'Iniciada';
      await this.rondaRepository.save(ronda);

      if (ronda.subasta && ronda.subasta.fechaInicio) {
        var fechaInicioSubasta = new Date(ronda.subasta.fechaInicio);
        //fechaInicioSubasta =  fromZonedTime(fechaInicioSubasta, 'America/La_Paz')

        const jobName = `I subasta-${ronda.subasta.id}`
        scheduleJob(jobName, fechaInicioSubasta, () => {
          this.subastaService.iniciarSubasta(ronda.subasta.id);
        });
  
        console.log('Subasta programada para iniciar el '+ fechaInicioSubasta);
      }

      console.log (Object.keys(scheduledJobs));
    }

    //Devuelve la ronda
    async findOne(id: number) {
      const ronda = await this.rondaRepository.findOne({
          relations: ['subasta'],
          where: { id: id },
        });
      if ( !ronda ) {
        throw new NotFoundException(`La ronda con el id ${ id } no fue encontrado.`)
      }
      //ronda.fechaInicio = ronda.fechaInicio.toLocaleString();
      return ronda;
    }


    // Devuelve todas las rondas en estado "En espera"
    async obtenerRondasEnEspera(): Promise<Ronda[]> {
      return await this.rondaRepository.find({
        where: { estado: 'Espera' },
      });
    }

    //Reprogramar rondas en espera
    async reprogramarRondas() {
      const rondas = await this.obtenerRondasEnEspera();
      rondas.forEach((ronda) => {
        const jobName = `ronda-${ronda.id}`;
        if (ronda.fechaInicio > new Date()) {
          scheduleJob(jobName, ronda.fechaInicio, () => {
            this.iniciarRonda(ronda.id);
          });

          console.log(`Ronda ${ronda.nombre} reprogramada para ${ronda.fechaInicio}`);
        }
      });
    }

    /*
    //OnModuleInit para reprogramar al iniciar el módulo
    async onModuleInit() {
      console.log("Reprogramando rondas en estado 'Espera'...");
      await this.reprogramarRondas();
    }   
    */
   
}
