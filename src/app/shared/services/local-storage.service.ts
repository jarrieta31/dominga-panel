import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

    private departamento: string = "";
    private localidad: string;

    constructor() {
        this.setDepartamento();
    }


    setDepartamento(depto?: string) {
        if (depto === undefined) {
            localStorage.setItem("departamento", "San José");
        }else{
            localStorage.setItem("departamento", depto);
        }
        this.departamento = localStorage.getItem("departamento");
    }

    getDepartamento(): string {
        return this.departamento;
    }
}
