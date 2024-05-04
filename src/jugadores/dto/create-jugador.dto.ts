import { IsArray, IsEmail, IsOptional, IsString, MinLength, isEmail, MaxLength } from 'class-validator';
import { Cuenta } from "src/cuenta/entities/cuenta.entity";

export class CreateJugadorDto {

    @IsString()
    @MinLength(4)
    nombre: string;

    @IsString()
    @MinLength(8)
    telefono: string;

    @IsString()
    @MinLength(6)
    ci: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(2)
    direccion: string;

    @IsString()
    @IsOptional()
    tokenMovil?: string;

    
    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @MaxLength(50)
    password: string;

    @IsArray()
    @IsOptional()
    cuentas?: Cuenta[];
}
