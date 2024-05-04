import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invitacion } from './entities/invitacion.entity';
import { Participante } from 'src/participante/entities/participante.entity';
import { Jugador } from 'src/jugadores/entities/jugador.entity';
import { CreateInvitacionDto } from './dto/create-invitacion.dto';
import { NotificationService } from 'src/notification/notification.service';
import { MailService } from 'src/mail/mail.service';
import { CreateParticipanteDto } from 'src/participante/dto/create-participante.dto';
import { ParticipanteService } from 'src/participante/participante.service';
import * as path from 'path';


@Injectable()
export class InvitacionService {

    private readonly logger = new Logger('InvitacionService') 
    constructor( 
        @InjectRepository( Invitacion ) private readonly invitacionRepository: Repository<Invitacion>, 
        @InjectRepository( Jugador ) private readonly jugadorRepository: Repository<Jugador>, 
        @InjectRepository( Participante ) private readonly participanteRepository: Repository<Participante>, 
        private readonly notificationService: NotificationService,
        private readonly mailService: MailService,
        private readonly participanteService: ParticipanteService,
        
    ) { }

    async create(createInvitacionDto: CreateInvitacionDto): Promise<Invitacion> {
        this.logger.log('Iniciando el método create()...');
        const { participanteId, ...rest } = createInvitacionDto;
        var [participante] = await Promise.all([
            this.participanteRepository.findOneBy({ id: participanteId }),
        ]);
        if (!participante) {
            throw new NotFoundException('El participante especificada no existe');
        }  
        const partida = participante.partida;
        const invitacion = this.invitacionRepository.create({
            participante,
            partidaId: partida.id,
            ...rest,
          });
          
        return await this.invitacionRepository.save(invitacion);

    }

    //Devuelve los invitados de la partida
    async getInvitados(id: number) {
        const invitados = await this.invitacionRepository.find({
            where: { partidaId: id },
            select: ['id', 'nombre', 'telefono', 'email', 'estado', 'partidaId'],
          });                  
        return invitados;
    }


    async enviarTodos(id: number) {
        const invitados = await this.invitacionRepository.createQueryBuilder("invitacion")
            .select("invitacion.id")
            .where("invitacion.partidaId = :id", { id })
            .andWhere("invitacion.estado = :estado", { estado: 'Espera' })
            .getMany();

        const respuestas = [];    
        for (const invitado of invitados) {
            const respuesta = await this.enviar(invitado.id);
            respuestas.push(respuesta);
        }
        return respuestas;
    }

    async enviar(id: number) {
        const invitado = await this.invitacionRepository.findOne({
            where: { id: id },
            relations: ['participante', 'participante.jugador','jugador'],
            select: ['id', 'nombre', 'telefono', 'email', 'estado', 'partidaId'],
        }); 

        //Asigna
        if( invitado.jugador == null){
            const jugador = await this.jugadorRepository.findOne({
                where: { telefono: invitado.telefono }
            });
            if(jugador != null){
                invitado.jugador = jugador;
                await this.invitacionRepository.save(invitado);
                console.log("Jugador asignado")
            }
        }
        
        const nombre = invitado.participante.jugador.nombre;
        const invitacion = invitado;
        const partida = invitado.participante.partida;
        
        const send1 = await this.notificationService.sendWhatsAppMessage(nombre,invitacion,partida);
        const send2 = await this.mailService.sendInviteMail(nombre,invitacion,partida);

        
        console.log(send1);
        console.log(send2);

        if(send1 == 'success' && send2 == 'success'){
            invitado.estado = 'Enviada';
            await this.invitacionRepository.save(invitado);             
        }else{
            return 'fail';
        }
        
        //push
        if( invitado.jugador != null){
            var title = "Nueva invitacion";
            var body = "As sido invitado a una nueva partida";
            await this.notificationService.sendPushNotificationIndividual(invitado.jugador,title,body);
        }
           
       return invitado;
    }


    //Devuelve las invitados del jugador
    async invitaciones(id: number){
        const invitados = await this.invitacionRepository.find ({
            where: {
                jugador: { id: id },
                estado: "Enviada"
            },
            relations: ['participante','participante.jugador'],
            select: ['id','participante'],
          });            

        const listaInvitaciones = invitados.map(invitacion => ({
            id: invitacion.id,
            jugadorNombre: invitacion.participante.jugador.nombre,
            partidaNombre: invitacion.participante.partida.nombre,
            partidaPozo: invitacion.participante.partida.pozo,
            partidaFecha: invitacion.participante.partida.fechaInicio
        }));
      
        console.log(listaInvitaciones[0]);      
        return listaInvitaciones;
    }


    //Acepta la invitacion
    async aceptar(id: number) {
        const invitacion = await this.invitacionRepository.findOne({
            where: { id: id },
            relations: ['participante','jugador'],
            select: ['id', 'nombre', 'telefono', 'email', 'estado', 'partidaId'],
          });      
        
        const createParticipanteDto: CreateParticipanteDto = {
            cuota: 0,
            recibido: false,
            estado: 'Espera',
            jugadorId: invitacion.jugador.id,
            partidaId: invitacion.participante.partida.id,
            rolId: 2
          };
        const participante = await this.participanteService.create(createParticipanteDto);        
        invitacion.estado = 'Aceptada';
        await this.invitacionRepository.save(invitacion);   
        return 'Aceptada';
    }


    async rechazar(id: number) {
        const invitacion = await this.invitacionRepository.findOne({
            where: { id: id },
          });      
        
        invitacion.estado = 'Rechazada';
        await this.invitacionRepository.save(invitacion);   
        return 'Rechazada';
    }

}

