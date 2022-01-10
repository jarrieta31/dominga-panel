import { Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    private _departamento: string;
    private _localidad: string;
    private _publicado: string;
    private _activos: string;

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

    get departamento(): string {
        if (localStorage.getItem("departamento") === undefined) {
            localStorage.setItem("departamento", 'San José');
        }
        this._departamento = localStorage.getItem("departamento");
        return this._departamento;
    }

    get localidad(): string {
        if (localStorage.getItem("localidad") === undefined) {
            localStorage.setItem("localidad", '');
        }
        this._localidad = localStorage.getItem("localidad");
        return this._localidad;
    }

    get publicado(): string {
        if (localStorage.getItem("publicado") === undefined) {
            localStorage.setItem("publicado", 'todos');
        }
        this._publicado = localStorage.getItem('publicado');
        return this._publicado;
    }

    get activos(): string {
        if (localStorage.getItem("activos") === undefined) {
            localStorage.setItem("activos", 'todos');
        }
        this._activos = localStorage.getItem('activos');
        return this._activos;
    }
}
