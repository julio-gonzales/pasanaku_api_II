import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Partida } from "src/partida/entities/partida.entity";
import { Subasta } from "src/subasta/entities/subasta.entity";
import { Transferencia } from "src/transferencia/entities/transferencia.entity";


@Entity()
export class Ronda {

    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({ type: 'text' })
    nombre: string
    
    @Column({ type: 'timestamp' })
    fechaInicio: Date;

    @Column({ type: 'enum', enum: ['Espera', 'Iniciada', 'Finalizada'] })
    estado: 'Espera' | 'Iniciada' | 'Finalizada';

    @ManyToOne(() => Partida, partida => partida.rondasEnpartida)
    partida: Partida;
    
    @OneToOne(() => Subasta, subasta => subasta.ronda,  { cascade: ['remove'], onDelete: 'CASCADE' })
    subasta: Subasta;

    @OneToMany(() => Transferencia, transferencia => transferencia.ronda, { cascade: ['remove'], onDelete: 'CASCADE' })
    transferencias: Transferencia[];

}
