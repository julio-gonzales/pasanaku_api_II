import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Moneda } from "src/moneda/entities/moneda.entity";
import { Participante } from "src/participante/entities/participante.entity";
import { Ronda } from "src/ronda/entities/ronda.entity";



@Entity()
export class Partida {

    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({ type: 'text' })
    nombre: string

    @Column({ type: 'integer'})
    pozo: number;
    
    @Column({ type: 'integer'})
    participantes: number;

    @Column({ type: 'integer'})
    coutaInicial: number;
    
    @Column({ type: 'timestamp' })
    fechaInicio: Date;

    @Column({ type: 'enum', enum: ['Semanal', 'Bisemanal', 'Mensual'] }) // Lapso de la partida
    lapso: 'Semanal' | 'Bisemanal' | 'Mensual'; 

    @Column({ type: 'enum', enum: ['Espera', 'Iniciada', 'Finalizada'] })
    estado: 'Espera' | 'Iniciada' | 'Finalizada';

    @ManyToOne(() => Moneda, moneda => moneda.partidas, { eager: true })
    moneda: Moneda;
    
    @OneToMany(() => Participante, participante => participante.partida)
    participantesEnPartida: Participante[];

    @OneToMany(() => Ronda, ronda => ronda.partida)
    rondasEnpartida: Ronda[];
}
