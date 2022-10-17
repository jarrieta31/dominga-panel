import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DondeComerService } from '../../services/donde-comer.service';
import { Observable, Subscription, Subject } from 'rxjs';
import { Restoran } from '../../interfaces/Restoran.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LocalStorageService } from '../../../shared/services/local-storage.service';
import { ConfigService } from '../../../shared/services/config.service';
import { takeUntil } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-listado',
    templateUrl: './listado.component.html',
    styleUrls: ['./listado.component.css']
})
export class ListadoComponent implements OnInit {

    titulo: string = "Lista donde comer";
    restaurantes$: Observable<Restoran[]>;
    restaurantes: Restoran[];

    published = [{ "estado": "Publicado", "valor": true }, { "estado": "Sin Publicar", "valor": false }];
    filtrosGuardados = [];
    localidades: string[] = [];
    departamentos: string[] = [];
    private destroy$ = new Subject<void>();
    departamentos$: Observable<string[]>;
    localidades$: Observable<string[]>;
    page: number = 1;
    opcionesSlectPublicado = [{"estado": "Publicados", "valor": 'publicados'}, {"estado": "Sin publicar", "valor": 'sinPublicar'},{"estado": "Ver todos", "valor": 'todos'}];


    filtrosForm: FormGroup = this.fb.group({
        departamento: [this.ls.departamento],
        localidad: [this.ls.localidad],
        publicado: [this.ls.publicado]
    })
    constructor(
        private comerService: DondeComerService,
        private configService: ConfigService,
        private ls:LocalStorageService,
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private router: Router,
        private title: Title,
    ) { 
        this.title.setTitle(this.titulo)
    }


    ngOnInit(): void {
        this.configService.getObsDepartamentos()
            .pipe( takeUntil( this.destroy$ ) )
            .subscribe(dptos => this.departamentos = dptos)
        this.configService.getObsLocalidades()
            .pipe(takeUntil( this.destroy$ ))
            .subscribe(locs => this.localidades = locs);
        this.comerService.getObsRestaurantes$()
            .pipe( takeUntil(this.destroy$) )
            .subscribe(restaurantes => this.restaurantes = restaurantes);
        this.configService.emitirDepartamentosActivos();
        this.configService.emitirLocalidades();
        this.comerService.getRestaurantesFirestore(this.ls.departamento);
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
        this.comerService.getRestaurantesFirestore(this.ls.departamento);
    }

    setFiltroLocalidad() {
        this.ls.localidad = this.localidad.value;
        this.comerService.getRestaurantesFirestore(this.ls.departamento);
    }

    setFiltroPublicados(){
        this.ls.publicado = this.publicado.value;
        this.comerService.getRestaurantesFirestore(this.ls.departamento);
    }

    resetFiltros(){
       this.ls.activos = 'todos';
       this.ls.localidad = '';
       this.localidad.setValue('');
       this.ls.publicado = 'todos';
       this.publicado.setValue('todos', {"estado": "Ver todos", "valor": 'todos'});
       this.comerService.getRestaurantesFirestore(this.ls.departamento);
    }


    /** 
     * Este método es llamado cada vez que se selecciona un departamento para llenar
     * el select-options con las localidades correspondientes al departamentos.
     */
    getLocalidadesPorDepartamento() {
        this.localidad.reset('');
        this.ls.departamento = this.departamento.value;
        this.configService.getLocadidadesDepartamento(this.departamento.value);
        this.comerService.getRestaurantesFirestore(this.departamento.value);
    }


    get departamento() { return this.filtrosForm.get('departamento'); }
    get localidad() {  return this.filtrosForm.get('localidad'); }
    get publicado() {  return this.filtrosForm.get('publicado'); };


    regresar() {
        this.router.navigate(["/donde-comer/listado"]);
    }

}
