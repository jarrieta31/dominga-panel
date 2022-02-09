import { Pipe, PipeTransform } from '@angular/core';
import { Slider } from '../interfaces/slider.interface';

@Pipe({
    name: 'imagen'
})
export class ImagenPipe implements PipeTransform {

    transform(slider: Slider): string {
        return slider.imagen.url;
    }
}
