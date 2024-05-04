import { IsObject, IsString, MaxLength, MinLength } from "class-validator";
import { Banco } from "src/banco/entities/banco.entity";

export class CreateCuentaDto {
    
    @IsString()
    @MinLength(20)
    nro: string;

    @IsString()
    @MinLength(2)
    @MaxLength(2)
    departamento: string;

    @IsString()
    @MinLength(1)
    jugadorId: number;
    
    @IsString()
    @MinLength(1)
    bancoId: number;

}
