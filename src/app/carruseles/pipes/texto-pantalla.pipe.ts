import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textoPantalla'
})
export class TextoPantallaPipe implements PipeTransform {

  transform(texto: string): string | null {
    if(texto !== null){
      return texto = texto.replace('_', " ").toLocaleUpperCase();
    }
    return null;
  }

}
