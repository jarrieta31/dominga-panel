import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { LugaresService } from '../../services/lugares.service';
import { Lugar, } from '../../interfaces/lugar.interface';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LocalidadesService } from '../../../shared/services/localidades.service';
import { LocalStorageService } from '../../../shared/services/local-storage.service';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
    selector: 'app-listado',
    templateUrl: './listado.component.html',
    styleUrls: ['./listado.component.css']
})
export class ListadoComponent implements OnInit, OnDestroy {

    panelOpenState = false;
    //private sourceLugares: Subscription;
    filtroDepartamento = false;
    filtroPublicado = false;
    departamentoSelec: string;
    publicadoSelec: boolean;
    published = [{ "estado": "Publicado", "valor": true }, { "estado": "Sin Publicar", "valor": false }];
    filtrosGuardados = [];
    localidades: string[] = [];
    departamentos: string[] = [];
    lugares: Lugar[];
    private sourceDepartamentos: Subscription;
    private sourceLocalidades: Subscription;
    private sourceLugares: Subscription;
    departamentos$: Observable<string[]>;
    localidades$: Observable<string[]>;
    lugares$: Observable<Lugar[]>;

    filtrosForm: FormGroup = this.fb.group({
        departamento: [''],
        localidad: ['']
    })

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private lugaresService: LugaresService,
        private localidadesService: LocalidadesService,
        private localStorageService: LocalStorageService) {
    }

    ngOnInit(): void {
        this.sourceDepartamentos = this.localidadesService.getObsDepartamentos().subscribe(dptos => { this.departamentos = dptos });
        this.localidadesService.emitirDepartamentosActivos();
        this.sourceLocalidades = this.localidadesService.getObsLocalidades().subscribe(locs => this.localidades = locs);
        this.departamento.setValue(this.localStorageService.departamento);
        this.localidadesService.emitirLocalidades();
        //this.sourceLugares = this.lugaresService.getObsLugares$().subscribe(lugares => this.lugares = lugares);
        this.lugares$ = this.lugaresService.getObsLugares$()
        this.lugaresService.getLugaresFirestore(this.departamento.value);
    }

    ngAfterViewInit(): void {
        //this.lugaresService.getLugaresPorDepartamento(this.departamento.value);
        //this.lugaresService.emitirLugares();
        //es para que no se vea el error de cambio
        this.cdRef.detectChanges();
    }

    ngOnDestroy(): void {
        this.sourceDepartamentos.unsubscribe();
        this.sourceLocalidades.unsubscribe();
        //this.sourceLugares.unsubscribe();
    }


    /** 
     * Este método es llamado cada vez que se selecciona un departamento
     */
    getLocalidadesPorDepartamento() {
        this.localidad.reset('');
        this.localStorageService.setDepartamento(this.departamento.value);
        this.localidadesService.getLocadidadesDepartamento(this.departamento.value);
        this.lugaresService.getLugaresFirestore(this.departamento.value);
        
    }

    getLugaresPorLocalidad(){
        this.lugaresService.getLugaresLocalidad(this.localidad.value);
    }

    /** LLama al metodo correspondiente del servicio lugares para hacer el filtro.
     * A partir de los filstros seleccionados por el usuario crea los paramentos
     * que debera enviar al hacer el llamado al servicio de lugares.service. 
     */
    filtrarLugares() {
        if (this.filtroDepartamento && this.filtroPublicado) {
            this.lugaresService.getLugaresPublicadoYDepartamento(this.publicadoSelec, this.departamento.value);
        }
        else if (this.filtroPublicado) {
            this.lugaresService.getLugaresPorEstado(this.publicadoSelec);
        }
        else if (!this.filtroPublicado && !this.filtroDepartamento) {
            this.lugaresService.emitirLugares();
        }

    }


    get departamento() {
        return this.filtrosForm.get('departamento');
    }

    get localidad() {
        return this.filtrosForm.get('localidad');
    }


}
