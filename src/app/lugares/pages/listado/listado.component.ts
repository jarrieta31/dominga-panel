import { Component, OnInit } from '@angular/core';
import { LugaresService } from '../../services/lugares.service';
import { Lugar, Departamento } from '../../interfaces/lugar.interface';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-listado',
    templateUrl: './listado.component.html',
    styleUrls: ['./listado.component.css']
})
export class ListadoComponent implements OnInit {

    lugares$: Observable<Array<Lugar>> = this.lugaresService.lugares$;
    panelOpenState = false;
    public departamentos = Object.values(Departamento);
    filtroDepartamento = false;
    filtroPublicado = false;
    departamentoSelec: string;
    lugares: Lugar[] = [];
    publicadoSelec: boolean;
    published = [{"estado": "Publicado", "valor": true}, {"estado": "Sin Publicar", "valor": false}];
    filtrosGuardados = [];

    constructor(private lugaresService: LugaresService) { }

    ngOnInit(): void {

    }

    /** Función que detecta el click sobre los checkboxs del filtro por departamento
     * y los agrega o quita del array departamentosAFiltrar
     */
   // selecCheckDepartamento(dep: string) {
   //     let depExiste = this.departamentosAFiltrar.includes(dep);
   //     if (depExiste) {
   //         this.departamentosAFiltrar = this.departamentosAFiltrar.filter((item) => {
   //             return item !== dep //retorna todos elementos diferentes a  item 
   //         });
   //     }
   //     else {
   //         //No se permiten mas de 10 condiciones OR concatenadas
   //         if(this.departamentosAFiltrar.length < 10){
   //             this.departamentosAFiltrar.push(dep);
   //         }
   //     }
   // }

    /** LLama al metodo correspondiente del servicio lugares para hacer el filtro.
     * A partir de los filstros seleccionados por el usuario crea los paramentos
     * que debera enviar al hacer el llamado al servicio de lugares.service. 
     */
    filtrarLugares() {
        if (this.filtroDepartamento && this.filtroPublicado) {
            this.lugares$ = this.lugaresService.getLugaresPublicadoYDepartamento( this.publicadoSelec, this.departamentoSelec);
        }
        else if (this.filtroDepartamento) {
            this.lugares$ = this.lugaresService.getLugaresPorDepartamento(this.departamentoSelec);
        }
        else if (this.filtroPublicado) {
            console.log("Estas haciendo un filtro por Publicacion");
            this.lugares$ = this.lugaresService.getLugaresPorEstado(this.publicadoSelec);
        }
        else if ( !this.filtroPublicado && !this.filtroDepartamento ){
            this.lugares$ = this.lugaresService.lugares$;
        }

    }


}
