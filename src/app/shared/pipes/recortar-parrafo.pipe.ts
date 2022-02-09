import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'recortarParrafo'
})
export class RecortarParrafoPipe implements PipeTransform {

    transform(titulo: string, nro: number): string {
        if (titulo.length >= nro) {
            return titulo = titulo.slice(0, nro) + "...";
        }
        return titulo;
    }

}
