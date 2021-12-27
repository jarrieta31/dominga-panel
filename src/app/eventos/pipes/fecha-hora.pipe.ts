import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '../../shared/interfaces/timestamp.interface';

@Pipe({
    name: 'fechaHora'
})
export class FechaHoraPipe implements PipeTransform {

    transform(fechaTimestamp: Timestamp): string {
        let f = new Date(fechaTimestamp.seconds * 1000);
        let hora: string = this.getHoraStr(f.getHours(), f.getMinutes());
        let fecha: string = this.getFechaStr(f);
        return `Fecha: ${fecha} Hora: ${hora}`;
    }


    /**
     * Recibe la hora y los minutos en formato numúmerico y la convierte a formato string retornando "hh:mm".
     * Este función sirve para setear y mostrar la hora en el formulario.
     * @param _hora Hora en formato numérico.
     * @param _minutos Minutos en formato numérico. 
     * @returns  Retorna la hora en el siguiente formato "hh:mm" no muestra los segundos.
     */
    getHoraStr( _hora: number, _minutos:number ): string{
        const horas: string[] = [];
        const minutos: string[] = [];
        //crear el array de horas
        for (let i = 0; i < 24; i++) { horas[i] = (i < 10) ? `0${i}` : `${i}` }
        //crear el array de minutos
        for (let i = 0; i < 60; i++) { minutos[i] = (i < 10) ? `0${i}` : `${i}` }
        let h = horas[_hora];
        let m = minutos[_minutos];
        return  `${h}:${m}`;
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
        for(let i = 1; i <= 31; i++){ dias[i] = ( i < 10 ) ? `0${i}` : `${i}` }
        for(let i = 0; i < 12; i++){ meses[i] = ( i < 9 ) ? `0${(i+1)}` : `${(i+1)}` }
        let dd: string = dias[_date.getDate()];
        let mm: string = meses[_date.getMonth()];
        let yyyy: string =  `${_date.getFullYear()}`;
        return `${dd}/${mm}/${yyyy}`;
    }

}
