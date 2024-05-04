import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

enum EstadoParticipante{
    Pago = 'Pago',
    Debe ='Debe',
    Ganador = 'Ganador',
    Espera = 'Espera'
  }

export class CreateParticipanteDto {  

    @IsNumber()
    @IsOptional()
    @Min(0)
    cuota?: number;

    @IsBoolean()
    @IsOptional()
    recibido?: boolean = false;

    @IsEnum(EstadoParticipante)
    @IsOptional()
    estado: 'Pago' | 'Debe' | 'Espera' | 'Ganador' = EstadoParticipante.Espera;

    @IsNumber()
    @IsNotEmpty()
    jugadorId: number;

    @IsNumber()
    @IsNotEmpty()
    partidaId: number;

    @IsNumber()
    @IsNotEmpty()
    rolId: number;

}
