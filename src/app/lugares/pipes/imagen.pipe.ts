import { Pipe, PipeTransform } from '@angular/core';
import { Lugar } from '../interfaces/lugar.interface';

@Pipe({
  name: 'imagen'
})
export class ImagenPipe implements PipeTransform {

  transform(lugar: Lugar): string {
    return `${lugar.imagenHome}`;
  }

}
