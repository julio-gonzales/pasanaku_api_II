import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Oferta } from "src/oferta/entities/oferta.entity";
import { Ronda } from "src/ronda/entities/ronda.entity";


@Entity()
export class Subasta {

    @PrimaryGeneratedColumn('increment')
    id: number
    
    @Column({ type: 'timestamp' })
    fechaInicio: Date;

    @Column({ type: 'timestamp' })
    fechaFinal: Date;

    @Column({ type: 'integer', nullable: true})
    jugadorId: number | null;

    @Column({ type: 'text', nullable: true })
    ganador: string | null;

    @Column({ type: 'integer', nullable: true})
    resultado: number | null;

    @Column({ type: 'enum', enum: ['Espera', 'Iniciada', 'Finalizada'] })
    estado: 'Espera' | 'Iniciada' | 'Finalizada';
    
    @OneToOne(() => Ronda, ronda => ronda.subasta, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'rondaId' })
    ronda: Ronda ;

    @OneToMany(() => Oferta, oferta => oferta.subasta, { cascade: ['remove'], onDelete: 'CASCADE' })
    ofertasDeSubasta: Oferta[];
}
