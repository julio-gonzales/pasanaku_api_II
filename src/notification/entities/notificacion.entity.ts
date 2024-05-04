import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Jugador } from "src/jugadores/entities/jugador.entity";


@Entity()
export class Notificacion {

    @PrimaryGeneratedColumn('increment')
    id: number

    @Column('text')
    title: string

    @Column('text')
    body: string

    @Column({ type: 'text' })
    fecha: string;

    @ManyToOne(() => Jugador, jugador => jugador.notificacionesDeJugador)
    jugador: Jugador ;  

}
