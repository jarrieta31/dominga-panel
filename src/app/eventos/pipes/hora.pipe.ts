import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '../../shared/interfaces/timestamp.interface';

@Pipe({
    name: 'hora'
})
export class HoraPipe implements PipeTransform {

    transform(fechaInicio: Timestamp): string {
        try {
            let fi = new Date(fechaInicio.seconds * 1000);
            let hora: string = this.getHoraStr(fi.getHours(), fi.getMinutes());
            return `${hora}`;

        } catch (error) {
            return "";
        }
    }

    /**
     * Recibe la hora y los minutos en formato numúmerico y la convierte a formato string retornando "hh:mm".
     * Este función sirve para setear y mostrar la hora en el formulario.
     * @param _hora Hora en formato numérico.
     * @param _minutos Minutos en formato numérico. 
     * @returns  Retorna la hora en el siguiente formato "hh:mm" no muestra los segundos.
     */
    getHoraStr(_hora: number, _minutos: number): string {
        const horas: string[] = [];
        const minutos: string[] = [];
        //crear el array de horas
        for (let i = 0; i < 24; i++) { horas[i] = (i < 10) ? `0${i}` : `${i}` }
        //crear el array de minutos
        for (let i = 0; i < 60; i++) { minutos[i] = (i < 10) ? `0${i}` : `${i}` }
        let h = horas[_hora];
        let m = minutos[_minutos];
        return `${h}:${m}`;
    }

}
