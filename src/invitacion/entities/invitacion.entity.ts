import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Jugador } from "src/jugadores/entities/jugador.entity";
import { Participante } from "src/participante/entities/participante.entity";

@Entity()
export class Invitacion {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'text' })
    nombre: string

    @Column('text')
    telefono: string

    @Column('text')
    email: string

    @Column({ type: 'enum', enum: ['Espera', 'Enviada', 'Aceptada', 'Rechazada'] })
    estado: 'Espera' | 'Enviada' | 'Aceptada' | 'Rechazada';

    @ManyToOne(() => Participante, participante => participante.invitacionesDeParticipante, { eager: true })
    participante: Participante;

    @ManyToOne(() => Jugador, jugador => jugador.invitacionesDeJugador, { nullable: true  })
    jugador: Jugador | null;

    @Column({ type: 'integer'})
    partidaId: number;
}
