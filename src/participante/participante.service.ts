import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotificationService } from 'src/notification/notification.service';
import { TransferenciaService } from 'src/transferencia/transferencia.service';

import { Partida } from 'src/partida/entities/partida.entity';
import { Jugador } from 'src/jugadores/entities/jugador.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Participante } from './entities/participante.entity';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { Subasta } from 'src/subasta/entities/subasta.entity';

@Injectable()
export class ParticipanteService {

    private readonly logger = new Logger('PartidaService') 

    constructor( 
        @InjectRepository( Partida ) private readonly partidaRepository: Repository<Partida>, 
        @InjectRepository( Jugador ) private readonly jugadorRepository: Repository<Jugador>, 
        @InjectRepository( Role ) private readonly roleRepository: Repository<Role>, 
        @InjectRepository( Participante ) private readonly participanteRepository: Repository<Participante>, 
        private readonly notificationService: NotificationService,
        private readonly transferenciaService: TransferenciaService,
    ) { }

    async create(createParticipanteDto: CreateParticipanteDto): Promise<Participante> {
        this.logger.log('Iniciando el método create()...');
        
        const { partidaId, jugadorId, rolId, ...rest } = createParticipanteDto;
        const [partida, jugador, rol] = await Promise.all([
            this.partidaRepository.findOneBy({ id: partidaId }),
            this.jugadorRepository.findOneBy({ id: jugadorId }),
            this.roleRepository.findOneBy({ id: rolId }),
        ]);
        this.logger.log('Iniciando el método create()...');
        if (!jugador) {
            throw new NotFoundException('El jugador especificada no existe');
        }
        if (!partida) {
            throw new NotFoundException('El partida especificada no existe');
        }
        const participante = this.participanteRepository.create({
            partida,
            jugador,
            cuenta: null,
            rol,
            ...rest,
          });
        jugador.participantesDeJugador.push(participante);  
          
        return await this.participanteRepository.save(participante);        
    }

        
    findAll() {
        return this.participanteRepository.find({});
    }

    async getParticipantes(id: number) {
        const participantes = await this.participanteRepository.find({
            where: {
                partida: { id: id },
            },
            relations: ['jugador'], // Incluir la relación con el jugador
        });    
        return participantes;
    }

    async coutas(subasta:Subasta, participantes:Participante[], ganador:Participante, partida:Partida){
        var couta = (partida.pozo - subasta.resultado) / (partida.participantes - 1);        
        couta = Math.ceil(couta);
        var title = "Subasta Finalizada";
        var body;
        
        for (const participante of participantes) {
            if(participante.jugador.id == subasta.jugadorId){
                participante.cuota = 0;
                participante.estado = 'Ganador';
                body = `Felicidades eres el ganador con ${subasta.resultado}`;
                if( participante.jugador.imagen == null){
                    body = `Felicidades eres el ganador con ${subasta.resultado} no tienes qr por favor sube uno`;
                }
                participante.recibido = true;

             }else{
                participante.cuota = couta;
                participante.estado = 'Debe';
                body = `El ganador es ${subasta.ganador} con ${subasta.resultado}.Tu cuota es de ${couta}`;
                this.transferenciaService.create(ganador,participante,subasta.ronda)
            }

            await this.participanteRepository.save(participante);
            await this.notificationService.sendPushNotificationIndividual(participante.jugador,title,body);
        }    
        


    }
}
