import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Participante } from 'src/participante/entities/participante.entity';

@Entity()
export class Role {

    @PrimaryGeneratedColumn('increment')
    id: number

    @Column('text',{
        unique: true,
    })
    nombre: string;

    @OneToMany(() => Participante, participante => participante.partida)
    participantesRol: Participante[];

}
