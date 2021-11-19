import { Component, OnDestroy, OnInit } from '@angular/core';
import { LugaresService } from '../../services/lugares.service';
import { Lugar, DepartamentoEnum } from '../../interfaces/lugar.interface';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LocalidadesService } from '../../../shared/services/localidades.service';


@Component({
    selector: 'app-listado',
    templateUrl: './listado.component.html',
    styleUrls: ['./listado.component.css']
})
export class ListadoComponent implements OnInit, OnDestroy {

    panelOpenState = false;
    public departamentos: string[] = [];
    private sourceDepartamentos: Subscription;
    lugares: Lugar[];
    //lugares$: Observable<Lugar[]>;
    private sourceLugares: Subscription;
    filtroDepartamento = false;
    filtroPublicado = false;
    departamentoSelec: string;
    publicadoSelec: boolean;
    published = [{ "estado": "Publicado", "valor": true }, { "estado": "Sin Publicar", "valor": false }];
    filtrosGuardados = [];

    constructor(private lugaresService: LugaresService, private localidadesService:LocalidadesService) {
    }

    ngOnInit(): void {
        //this.lugaresService.cargarLugares();
        this.sourceLugares = this.lugaresService.getObsLugares$().subscribe(lugares => this.lugares = lugares);
        this.sourceDepartamentos = this.localidadesService.getObsDepartamentos().subscribe(dpts => this.departamentos = dpts);
        this.lugaresService.getLugaresLocal();
        this.localidadesService.emitirDepartamentosActivos();
    }

    ngOnDestroy(): void {
        this.sourceLugares.unsubscribe();
        this.sourceDepartamentos.unsubscribe();
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
            this.lugaresService.getLugaresPublicadoYDepartamento(this.publicadoSelec, this.departamentoSelec);
        }
        else if (this.filtroDepartamento) {
            this.lugaresService.getLugaresPorDepartamento(this.departamentoSelec);
        }
        else if (this.filtroPublicado) {
            this.lugaresService.getLugaresPorEstado(this.publicadoSelec);
        }
        else if (!this.filtroPublicado && !this.filtroDepartamento) {
            this.lugaresService.getLugaresLocal();
        }

    }


}
