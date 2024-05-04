import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Cuenta } from "src/cuenta/entities/cuenta.entity";
import { Invitacion } from "src/invitacion/entities/invitacion.entity";
import { Notificacion } from "src/notification/entities/notificacion.entity";
import { Participante } from "src/participante/entities/participante.entity";


@Entity()
export class Jugador {

    @PrimaryGeneratedColumn('increment')
    id: number

    @Column('text')
    nombre: string

    @Column('text', {
        unique: true
    })
    telefono: string

    @Column('text', {
        unique: true
    })
    ci: string

    @Column('text', {
        unique: true
    })
    email: string
    
    @Column('text')
    direccion: string

    @Column('text', {select: false})
    password:  string;

    @Column({ nullable: true })
    tokenMovil: string | null

    @Column({ nullable: true })
    imagen: string | null
    
    @OneToMany( 
        () => Cuenta,
        (cuenta) => cuenta.jugador, 
        { cascade: true, eager: true } )
    cuentas : Cuenta[];

    @OneToMany(() => Participante, participante => participante.jugador,{ cascade: true, eager: true })
    participantesDeJugador: Participante[];

    @OneToMany(() => Invitacion, invitacion => invitacion.jugador,{ cascade: true})
    invitacionesDeJugador: Invitacion[];    

    @OneToMany(() => Notificacion, notificacion => notificacion.jugador,{ cascade: true})
    notificacionesDeJugador: Invitacion[];    
}
