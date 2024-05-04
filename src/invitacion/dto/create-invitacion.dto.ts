import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Cuenta } from "src/cuenta/entities/cuenta.entity";

enum EstadoInvitacion{
    Espera = 'Espera',
    Enviada = 'Enviada',
    Aceptada = 'Aceptada',
    Rechazada = 'Rechazada'   
  }

export class CreateInvitacionDto {  

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    telefono: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    email: string;

    @IsEnum(EstadoInvitacion)
    estado: 'Espera' | 'Enviada' | 'Aceptada' | 'Rechazada';
    
    @IsNumber()
    @IsNotEmpty()
    participanteId: number;

}