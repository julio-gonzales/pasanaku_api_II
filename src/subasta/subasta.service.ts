import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { addMinutes } from 'date-fns/addMinutes';
import { scheduleJob } from 'node-schedule';
import { Repository } from 'typeorm';

import { NotificationService } from 'src/notification/notification.service';
import { ParticipanteService } from 'src/participante/participante.service';

import { Subasta } from './entities/subasta.entity';
import { Oferta } from 'src/oferta/entities/oferta.entity';
import { Ronda } from 'src/ronda/entities/ronda.entity';

@Injectable()
export class SubastaService {
    constructor(
        @InjectRepository( Ronda ) private readonly rondaRepository: Repository<Ronda>,
        @InjectRepository( Subasta ) private readonly subastaRepository: Repository<Subasta>,
        @InjectRepository( Oferta ) private readonly ofertaRepository: Repository<Oferta>,
        private readonly notificationService: NotificationService,
        private readonly participanteService: ParticipanteService
    ) {}

    async create(ronda: Ronda){
        var fechaInicio = addMinutes(ronda.fechaInicio, 2);
        var fechaFinal = addMinutes(fechaInicio, 3);
        const subasta = this.subastaRepository.create({
                fechaInicio,
                fechaFinal,
                estado: 'Espera',
                ronda,
            });

        await this.subastaRepository.save(subasta);
    }


    async iniciarSubasta(id: number) {
        const subasta = await this.subastaRepository.findOne({
            relations: ['ronda','ronda.partida'],
            where: { id: id },
        }); 
        if ( !subasta ) {
            throw new NotFoundException(`La partida con el id ${ id } no fue encontrado.`)
        }  

        subasta.estado = 'Iniciada';
        await this.subastaRepository.save(subasta);
        console.log("Subasta Iniciada");

        const fechaFinal = new Date(subasta.fechaFinal);
        //console.log('final' + fechaFinal);
        const jobName = `F subasta-${subasta.id}`
        scheduleJob(jobName,fechaFinal, () => {
          this.finalizarSubasta(subasta.id);
        });
        console.log('Subasta programada para finalizar el '+ fechaFinal);

        var title = "Subasta Inciada";
        const body = `Subasta de la ${subasta.ronda.partida.nombre} ${subasta.ronda.nombre} ha comenzado.`;
        console.log(body);
        await this.notificationService.sendPushNotification(subasta.ronda.partida.id,title,body);

    }

    
    async finalizarSubasta(id: number) {
        const subasta = await this.subastaRepository.findOne({
            relations: ['ofertasDeSubasta','ronda.partida.participantesEnPartida.jugador'],
            where: { id: id },
          });
        if ( !subasta ) {
          throw new NotFoundException(`La ronda con el id ${ id } no fue encontrado.`)
        }
        
        subasta.estado = 'Finalizada';
        const partida = subasta.ronda.partida;
        let participantes = subasta.ronda.partida.participantesEnPartida;
        var ganador;

        if (subasta.ofertasDeSubasta.length == 0) {
            //No hay ofertas
            console.log("La subasta no tiene ofertas.");
            const opciones = participantes;
            let elegido;

            for (const opcion of opciones) {
                if (opcion.recibido == false) {
                    elegido = opcion;
                    break;
                }
            }
            subasta.jugadorId = elegido.jugador.id; 
            subasta.ganador = elegido.jugador.nombre; 
            subasta.resultado = 0;
            ganador = elegido;
        } else {
            //Hay ofertas
            console.log("La subasta tiene ofertas.");
            const ofertas = subasta.ofertasDeSubasta;
            let ofertaConMayorPuja = ofertas[0];
            for (const oferta of ofertas) {
                if (oferta.puja > ofertaConMayorPuja.puja) {
                    ofertaConMayorPuja = oferta;
                }
            }
            console.log(ofertaConMayorPuja);    
            const oferta = await this.ofertaRepository.findOne({
                relations: ['participante','participante.jugador'],
                where: { id: ofertaConMayorPuja.id },
              });

            subasta.jugadorId = oferta.participante.jugador.id; 
            subasta.ganador = oferta.participante.jugador.nombre; 
            subasta.resultado = oferta.puja;
            ganador = oferta.participante;
        }

        await this.subastaRepository.save(subasta);       
        console.log("Subasta finalizada");

        await this.participanteService.coutas(subasta,participantes,ganador,partida);
        
        
    }

    //Devuelve la subasta
    async findOne(id: number) {
        const subasta = await this.subastaRepository.findOne({
            where: { id: id },
          });
        if ( !subasta ) {
          throw new NotFoundException(`La ronda con el id ${ id } no fue encontrado.`)
        }
        
        /*
        const subasta = await this.subastaRepository.findOne({
            relations: ['ofertasDeSubasta','ronda.partida.participantesEnPartida.jugador'],
            where: { id: id },
          });
        if ( !subasta ) {
          throw new NotFoundException(`La ronda con el id ${ id } no fue encontrado.`)
        }
        subasta.estado = 'Finalizada';
        let participanteId;
        
        if (subasta.ofertasDeSubasta.length == 0) {
            console.log("La subasta no tiene ofertas.");
            const opciones = subasta.ronda.partida.participantesEnPartida;
            let elegido;
            for (const opcion of opciones) {
                if (opcion.recibido == false) {
                    elegido = opcion;
                    break;
                }
            }
            subasta.jugadorId = elegido.jugador.id; 
            subasta.ganador = elegido.jugador.nombre; 
            subasta.resultado = 0;
            participanteId = elegido.id;
        } else {
            console.log("La subasta tiene ofertas.");
            const ofertas = subasta.ofertasDeSubasta;
            let ofertaConMayorPuja = ofertas[0];
            for (const oferta of ofertas) {
                if (oferta.puja > ofertaConMayorPuja.puja) {
                    ofertaConMayorPuja = oferta;
                }
            }
            console.log(ofertaConMayorPuja);    
            const oferta = await this.ofertaRepository.findOne({
                relations: ['participante','participante.jugador'],
                where: { id: ofertaConMayorPuja.id },
              });

            subasta.jugadorId = oferta.participante.jugador.id; 
            subasta.ganador = oferta.participante.jugador.nombre; 
            subasta.resultado = oferta.puja;
            participanteId = oferta.participante.id;  
        }
        console.log(participanteId);
        
        await this.subastaRepository.save(subasta); 
        //ronda.fechaInicio = ronda.fechaInicio.toLocaleString();
        */
        return subasta;
    }
    /*
    findAll() {
        return this.subastaRepository.find({});
    }
    */
}
