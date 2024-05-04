import { Catch, ExceptionFilter, ArgumentsHost,NotFoundException,InternalServerErrorException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    if (exception instanceof BadRequestException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof NotFoundException) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    } else if (exception instanceof InternalServerErrorException) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Error al ejecutar la consulta en la base de datos';
    }

    response.status(status).json({
      status,
      message,
      error: exception.name,
    });
  }

  private extractValidationErrorMessage(errors: ValidationError[]): string {
    const messages = errors.map(err => Object.values(err.constraints)).flat();
    return messages.join(', ');
  }

}
