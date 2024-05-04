import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Banco } from "src/banco/entities/banco.entity";
import { Jugador } from "src/jugadores/entities/jugador.entity";
import { Participante } from "src/participante/entities/participante.entity";


@Entity()
export class Cuenta {

    @PrimaryGeneratedColumn('increment')
    id: number

    @Column('text', {
        unique: true,
    })
    nro: string

    @Column('text')
    departamento: string

    @ManyToOne( 
        () => Jugador,
        ( jugador ) => jugador.cuentas,
        { onDelete: 'CASCADE'}
    )
    jugador: Jugador;

    // Relación Muchos a Uno: muchas cuentas pertenecen a un solo banco
    @ManyToOne(() => Banco, banco => banco.cuentas, { eager:true })
    banco: Banco;

    @OneToOne(() => Participante, participante => participante.cuenta)
    participante: Participante;
}
