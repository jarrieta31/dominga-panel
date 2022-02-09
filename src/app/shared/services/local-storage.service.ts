import { Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    private _departamento: string;
    private _localidad: string;
    private _publicado: string;
    private _activos: string;
    private _slider: string;

    constructor() {
    }

    set departamento(dpto: string) {
        localStorage.setItem("departamento", dpto);
    }

    set localidad(loc: string) {
        localStorage.setItem("localidad", loc);
    }

    set publicado(pub: string) {
            localStorage.setItem("publicado", pub );
    }

    set activos(activos: string) {
        localStorage.setItem("activos", activos );
    }

    set slider(slider: string) {
        localStorage.setItem("slider", slider );
    }

    get departamento(): string {
        let s = localStorage.getItem("departamento");
        if ( s === undefined || s === null) {
            localStorage.setItem("departamento", 'San José');
        }
        this._departamento = localStorage.getItem("departamento");
        return this._departamento;
    }

    get localidad(): string {
        let s = localStorage.getItem("localidad");
        if ( s === undefined || s === null) {
            localStorage.setItem("localidad", '');
        }
        this._localidad = localStorage.getItem("localidad");
        return this._localidad;
    }

    get publicado(): string {
        let s = localStorage.getItem("publicado");
        if ( s === undefined || s === null) {
            localStorage.setItem("publicado", 'todos');
        }
        this._publicado = localStorage.getItem('publicado');
        return this._publicado;
    }

    get activos(): string {
        let s = localStorage.getItem("activos");
        if ( s === undefined || s === null) {
            localStorage.setItem("activos", 'todos');
        }
        this._activos = localStorage.getItem('activos');
        return this._activos;
    }

    get slider(): string {
        let s = localStorage.getItem('slider');
        if (s === undefined || s  === null ) {
            localStorage.setItem("slider", 'artistas');
        }
        this._slider = localStorage.getItem('slider');
        return this._slider;
    }

    
}
