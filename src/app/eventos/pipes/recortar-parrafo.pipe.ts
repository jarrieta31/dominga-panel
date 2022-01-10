import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'recortarParrafo'
})
export class RecortarParrafoPipe implements PipeTransform {


    transform(texto: string): string {
        var logitud = 125;
        var textoAMostrar = "";

        for (var i = 0; i < logitud && i < texto.length; i++)
            textoAMostrar = textoAMostrar + texto[i];

        textoAMostrar = textoAMostrar + " ...";

        return textoAMostrar;
    }
}
