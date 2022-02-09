import { Pipe, PipeTransform } from '@angular/core';
import { Hotel } from '../interfaces/hotel.interface';

@Pipe({
  name: 'imagen'
})
export class ImagenPipe implements PipeTransform {

    transform(hotel: Hotel): string {
        return hotel.imagen.url;
    }

}
