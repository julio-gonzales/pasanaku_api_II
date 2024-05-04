import { IsArray, IsOptional, IsString, MinLength } from "class-validator";
import { Partida } from "src/partida/entities/partida.entity";

export class CreateMonedaDto {

    @IsString()
    @MinLength(4)
    nombre: string;

    @IsArray()
    @IsOptional()
    partidas?: Partida[];

}
