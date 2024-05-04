import { IsArray, IsEmail, IsOptional, IsString, MinLength, isEmail, MaxLength, IsNotEmpty } from 'class-validator';
import { Cuenta } from "src/cuenta/entities/cuenta.entity";

export class SendWhatsAppDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;
  
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @IsNotEmpty()
    @IsString()
    numero: string;
  }
