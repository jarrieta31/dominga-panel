import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LugaresService } from '../../services/lugares.service';
import { Lugar, } from '../../interfaces/lugar.interface';
import { Observable, Subject, Subscription } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { ConfigService } from '../../../shared/services/config.service';
import { LocalStorageService } from '../../../shared/services/local-storage.service';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
    selector: 'app-listado',
    templateUrl: './listado.component.html',
    styleUrls: ['./listado.component.css']
})
export class ListadoComponent implements OnInit, OnDestroy {

    filtroPublicado = false;
    publicadoSelec: boolean;
    published = [{ "estado": "Publicado", "valor": true }, { "estado": "Sin Publicar", "valor": false }];
    filtrosGuardados = [];
    localidades: string[] = [];
    departamentos: string[] = [];
    titulo:string = "Lista lugares"

    private destroy$ = new Subject<void>();
    public lugares: Lugar[];
    departamentos$: Observable<string[]>;
    localidades$: Observable<string[]>;
    lugares$: Observable<Lugar[]>;
    page: number = 1;
    opcionesSlectPublicado = [{"estado": "Publicados", "valor": 'publicados'}, {"estado": "Sin publicar", "valor": 'sinPublicar'},{"estado": "Ver todos", "valor": 'todos'}];


    filtrosForm: FormGroup = this.fb.group({
        departamento: [this.ls.departamento],
        localidad: [this.ls.localidad],
        publicado: [this.ls.publicado]
    })

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private lugaresService: LugaresService,
        private configService: ConfigService,
        private ls: LocalStorageService) {
    }

    ngOnInit(): void {
        this.configService.getObsDepartamentos().pipe(takeUntil(this.destroy$)).subscribe(dptos => { this.departamentos = dptos });
        this.configService.emitirDepartamentosActivos();
        this.configService.getObsLocalidades().pipe(takeUntil(this.destroy$)).subscribe(locs => this.localidades = locs);
        this.configService.emitirLocalidades();
        this.lugaresService.getObsLugares$().pipe(takeUntil(this.destroy$)).subscribe(lugares => this.lugares = lugares);
        
        //this.lugares$ = this.lugaresService.getObsLugares$();
        //Chequea si los lugares del departamento actual estan en cache.

        //this.configService.cargarTiposArtistas();
        //this.configService.cargarTiposEventos();
        //this.configService.cargarTiposLugares();
        //this.configService.cargarConfiguracion();
        if (!this.lugaresService.checkCache(this.departamento.value)) {
            this.lugaresService.getLugaresFirestore(this.departamento.value);
        }
    }

    ngAfterViewInit(): void {
        this.cdRef.detectChanges();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


    /** 
     * Este método es llamado cada vez que se selecciona un departamento
     */
    setFiltroDepartamento() {
        this.localidad.reset('');
        this.ls.localidad = '';
        this.ls.departamento = this.departamento.value;
        this.configService.getLocadidadesDepartamento(this.ls.departamento);
        this.lugaresService.getLugaresFirestore(this.ls.departamento);
    }

    setFiltroLocalidad() {
        this.ls.localidad = this.localidad.value;
        this.lugaresService.getLugaresFirestore(this.ls.departamento);
    }

    setFiltroPublicados(){
        this.ls.publicado = this.publicado.value;
        this.lugaresService.getLugaresFirestore(this.ls.departamento);
    }

    resetFiltros(){
       this.ls.activos = 'todos';
       this.ls.localidad = '';
       this.localidad.setValue('');
       this.ls.publicado = 'todos';
       this.publicado.setValue('todos', {"estado": "Ver todos", "valor": 'todos'});
       this.lugaresService.getLugaresFirestore(this.ls.departamento);
    }


    /** 
     * Este método es llamado cada vez que se selecciona un departamento para llenar
     * el select-options con las localidades correspondientes al departamentos.
     */
    getLocalidadesPorDepartamento() {
        this.localidad.reset('');
        this.ls.departamento = this.departamento.value;
        this.configService.getLocadidadesDepartamento(this.departamento.value);
        this.lugaresService.getLugaresFirestore(this.departamento.value);
    }


    get departamento() { return this.filtrosForm.get('departamento'); }
    get localidad() {  return this.filtrosForm.get('localidad'); }
    get publicado() {  return this.filtrosForm.get('publicado'); };
}
