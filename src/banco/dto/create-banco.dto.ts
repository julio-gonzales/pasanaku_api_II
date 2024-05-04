import { IsArray, IsOptional, IsString, MinLength } from "class-validator";
import { Cuenta } from "src/cuenta/entities/cuenta.entity";

export class CreateBancoDto {

    @IsString()
    @MinLength(4)
    nombre: string;

    @IsArray()
    @IsOptional()
    cuentas?: Cuenta[];

}
