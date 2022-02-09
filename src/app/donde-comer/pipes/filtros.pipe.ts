import { Pipe, PipeTransform } from '@angular/core';
import { Restoran } from '../interfaces/Restoran.interface';

@Pipe({
  name: 'filtros'
})
export class FiltrosPipe implements PipeTransform {

  transform(restaurantes: Restoran[], texto: string): Restoran[] {
    
    if(texto.length === 0){
    	return restaurantes;
    }

    texto = texto.toLowerCase();

    return restaurantes.filter( item => {
    	return item.nombre.toLowerCase().includes(texto)
    	|| item.direccion.toLowerCase().includes(texto)
    })
  }
}
