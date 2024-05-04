import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';


export class CreateEmailDto {     
    @IsNumber()
    @IsNotEmpty()
    invitacionId: number;

}