import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

    departamento: string = "";
    localidad: string = '';
    publicado: string = '';

    constructor() {
        this.setDepartamento( localStorage.getItem('departamento') );
    }


    setDepartamento(dpto?: string):void {
        if (dpto === undefined || dpto === null) {
            localStorage.setItem("departamento", "San José");
        }else{
            localStorage.setItem("departamento", dpto);
        }
        this.departamento = localStorage.getItem("departamento");
    }

    setLocalidad(loc: string): void {
        if (loc === undefined) {
            localStorage.setItem("localidad", "San José de Mayo");
        }else{
            localStorage.setItem("localidad", loc);
        }
        this.localidad = localStorage.getItem("localidad");
    }

    setPublicado(pub: string){
        if (pub === undefined) {
            localStorage.setItem("publicado", "false");
        }else{
            localStorage.setItem("publicado", pub);
        }
        this.publicado = localStorage.getItem("publicado");
    }
}
