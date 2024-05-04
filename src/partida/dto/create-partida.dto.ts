import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

enum LapsoPartida {
  Semanal = 'Semanal',
  Bisemanal = 'Bisemanal',
  Mensual = 'Mensual',
}

enum EstadoPartida {
  Espera = 'Espera',
  Iniciada = 'Iniciada',
  Finalizada = 'Finalizada',
}
export class CreatePartidaDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    nombre: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    pozo?: number;

    @IsInt()
    @Min(0)
    participantes: number;

    @IsInt()
    coutaInicial: number;

    @IsString()
    @IsNotEmpty()
    fechaInicio: string;

    @IsEnum(LapsoPartida)
    lapso: 'Semanal' | 'Bisemanal' | 'Mensual';

    @IsEnum(EstadoPartida)
    estado: 'Espera' | 'Iniciada' | 'Finalizada';

    @IsNumber()
    @IsNotEmpty()
    monedaId: number;
}
