import { Pipe, PipeTransform } from '@angular/core';
import { Restoran } from '../interfaces/Restoran.interface';

@Pipe({
    name: 'imagen'
})
export class ImagenPipe implements PipeTransform {

    transform(restoran: Restoran): string {
        return restoran.imagen.url;
    }

}

