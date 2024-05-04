import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Participante } from "src/participante/entities/participante.entity";
import { Subasta } from "src/subasta/entities/subasta.entity";


@Entity()
export class Oferta {

    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({ type: 'integer'})
    puja: number;

    @Column({ type: 'timestamp' })
    fecha: Date;
    
    @ManyToOne(() => Subasta, subasta => subasta.ofertasDeSubasta, { onDelete: 'CASCADE' })
    subasta: Subasta;

    @ManyToOne(() => Participante, participante => participante.ofertasDeParticipante)
    participante: Participante;

}
