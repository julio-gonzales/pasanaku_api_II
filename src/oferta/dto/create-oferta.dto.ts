import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateOfertaDto {  

    @IsInt()
    puja: number;

    @IsNumber()
    @IsNotEmpty()
    subastaId: number;
    
    @IsNumber()
    @IsNotEmpty()
    jugadorId: number;

}