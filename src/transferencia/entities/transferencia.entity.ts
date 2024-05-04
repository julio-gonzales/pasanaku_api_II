import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Participante } from "src/participante/entities/participante.entity";
import { Ronda } from "src/ronda/entities/ronda.entity";


@Entity()
export class Transferencia {

    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({ type: 'integer'})
    monto: number;

    @Column({ type: 'integer', nullable: true})
    contador: number | null;

    @Column({ type: 'timestamp' })
    fecha: Date;

    @Column({ type: 'enum', enum: ['Debe', 'Pagada'] })
    estado: 'Debe' | 'Pagada';

    @ManyToOne(() => Ronda, ronda => ronda.transferencias, { onDelete: 'CASCADE' })
    ronda: Ronda;

    // Relación para el que paga
    @ManyToOne(() => Participante, participante => participante.transferenciasComoDeudor)
    deudor: Participante;

    // Relación para el que recibe
    @ManyToOne(() => Participante, participante => participante.transferenciasComoReceptor)
    receptor: Participante;

}
