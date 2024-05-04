import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cuenta } from "src/cuenta/entities/cuenta.entity";
import { Jugador } from "src/jugadores/entities/jugador.entity";
import { Partida } from "src/partida/entities/partida.entity";
import { Role } from "src/roles/entities/role.entity";
import { Invitacion } from "src/invitacion/entities/invitacion.entity";
import { Oferta } from "src/oferta/entities/oferta.entity";
import { Transferencia } from "src/transferencia/entities/transferencia.entity";

@Entity()
export class Participante {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'int' })
    cuota: number;

    @Column({ type: 'enum', enum: ['Pago', 'Debe', 'Ganador','Espera'] })
    estado: 'Pago' | 'Debe' | 'Espera' | 'Ganador';

    @Column({ type: 'boolean'})
    recibido: boolean;

    @ManyToOne(() => Partida, partida => partida.participantesEnPartida, { eager: true })
    partida: Partida;

    @ManyToOne(() => Jugador, jugador => jugador.participantesDeJugador)
    jugador: Jugador;

    @ManyToOne(() => Role, rol => rol.participantesRol, { eager: true })
    rol: Role;

    @OneToOne(() => Cuenta, cuenta => cuenta.participante, { nullable: true })
    @JoinColumn({ name: 'cuentaId' })
    cuenta: Cuenta | null;

    @OneToMany(() => Invitacion, invitacion => invitacion.participante)
    invitacionesDeParticipante: Invitacion[];

    @OneToMany(() => Oferta, oferta => oferta.participante)
    ofertasDeParticipante: Oferta[];

    // Relación para transferencias donde el participante es el deudor
    @OneToMany(() => Transferencia, transferencia => transferencia.deudor)
    transferenciasComoDeudor: Transferencia[];

    // Relación para transferencias donde el participante es el receptor
    @OneToMany(() => Transferencia, transferencia => transferencia.receptor)
    transferenciasComoReceptor: Transferencia[];
}
