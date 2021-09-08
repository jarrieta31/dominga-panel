import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'deleteHtml'
})
export class DeleteHtmlPipe implements PipeTransform {

  transform(texto: string): string {
    return texto.replace(/<\/?[^>]+(>|$)/g, '');
  }

}
