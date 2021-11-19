import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'quitarEspacios'
})
export class QuitarEspaciosPipe implements PipeTransform {

  transform(texto: string): string | null {
    texto = texto.replace(/\s/g, "");
    if (texto.length === 0) {
      return null;
    }
    return texto;
  }

}
