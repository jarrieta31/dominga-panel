import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '../../shared/interfaces/timestamp.interface';

@Pipe({
    name: 'fecha'
})
export class FechaPipe implements PipeTransform {

    transform( inicio: Timestamp, fin?: Timestamp): string {
        try {
                let fi = new Date( inicio.seconds * 1000 );
                let fInicial: string = this.getFechaStr(fi);
                let ff = new Date( fin.seconds * 1000 );
                let fFinal: string = this.getFechaStr(ff);
            if ( inicio.seconds === fin.seconds) {
                return `${fInicial}`;
            }else{
                return `Desde el ${fInicial} al ${fFinal}`
            }

        } catch (error) {
            return "";
        }
    }

    /**
     * Recibe la fecha en un objeto Momente y retorna la fecha en string para poder usarla al crear la fecha del evento
     * para enviar.
     * @param _date Es la fecha y la obtenida del datapicker 
     * @returns 
     */
    getFechaStr(_date: Date): string {
        const dias: string[] = [];
        const meses: string[] = [];
        for (let i = 1; i <= 31; i++) { dias[i] = (i < 10) ? `0${i}` : `${i}` }
        for (let i = 0; i < 12; i++) { meses[i] = (i < 9) ? `0${(i + 1)}` : `${(i + 1)}` }
        let dd: string = dias[_date.getDate()];
        let mm: string = meses[_date.getMonth()];
        let yyyy: string = `${_date.getFullYear()}`;
        return `${dd}/${mm}/${yyyy}`;
    }

}
