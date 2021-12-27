import { Pipe, PipeTransform } from '@angular/core';
import { Evento } from '../interfaces/evento.interface';

@Pipe({
    name: 'imagen'
})
export class ImagenPipe implements PipeTransform {

    transform(evento: Evento): string {
        return `${ evento.imagen.url }`;
    }
}
