import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { EventosService } from '../../services/eventos.service';
import { Evento } from '../../interfaces/evento.interface';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from '../../../shared/services/config.service';
import { LocalStorageService } from '../../../shared/services/local-storage.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-listado',
    templateUrl: './listado.component.html',
    styleUrls: ['./listado.component.css']
})
export class ListadoComponent implements OnInit {

    titulo: string = "Lista eventos"; 
    eventos: Evento[];
    publicadoSelec: boolean;
    page: number = 1;
    private sourceDepartamentos: Subscription;
    private sourceLocalidades: Subscription;
    private sourceEventos: Subscription;
    filtrosGuardados = [];
    localidades: string[] = [];
    departamentos: string[] = [];
    opcionesSlectActivo = [{"estado": "Ver todos", "valor": 'todos'}, {"estado": "Ver inactivos", "valor": "inactivos"},{"estado": "Ver activos", "valor": "activos"}];
    opcionesSlectPublicado = [{"estado": "Publicados", "valor": 'publicados'}, {"estado": "Sin publicar", "valor": 'sinPublicar'},{"estado": "Ver todos", "valor": 'todos'}];


    filtrosForm: FormGroup = this.fb.group({
        departamento: [this.ls.departamento],
        localidad: [this.ls.localidad],
        activos: [this.ls.activos],
        publicado: [this.ls.publicado]
    })

    constructor(
        private eventosService:EventosService,
        private router: Router,
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private configService: ConfigService,
        private ls: LocalStorageService 
    ) { }


    ngOnInit(): void {
        this.sourceDepartamentos = this.configService.getObsDepartamentos().subscribe(dptos => { this.departamentos = dptos });
        this.configService.emitirDepartamentosActivos();
        this.sourceLocalidades = this.configService.getObsLocalidades().subscribe(locs => this.localidades = locs);
        this.configService.emitirLocalidades();
        this.sourceEventos = this.eventosService.getObsEventos$().subscribe(eventos => this.eventos = eventos);
        this.eventosService.getEventosFirestore(localStorage.getItem("departamento"));
    }

    ngOnDestroy(): void {
        this.sourceDepartamentos.unsubscribe();
        this.sourceLocalidades.unsubscribe();
        this.sourceEventos.unsubscribe();
    }


    /** 
     * Este método es llamado cada vez que se selecciona un departamento
     */
    setFiltroDepartamento() {
        this.localidad.reset('');
        this.ls.localidad = '';
        this.ls.departamento = this.departamento.value;
        this.configService.getLocadidadesDepartamento(this.ls.departamento);
        this.eventosService.getEventosFirestore(this.ls.departamento);
    }

    setFiltroLocalidad() {
        this.ls.localidad = this.localidad.value;
        this.eventosService.getEventosFirestore(this.ls.departamento);
    }

    setFiltroActivos(){
        this.ls.activos = this.activos.value;
        this.eventosService.getEventosFirestore(this.ls.departamento);
    }

    setFiltroPublicados(){
        this.ls.publicado = this.publicado.value;
        this.eventosService.getEventosFirestore(this.ls.departamento);
    }

    resetFiltros(){
       this.ls.activos = 'todos';
       this.activos.setValue('todos',{"estado": "Ver todos", "valor": 'todos'});
       this.ls.localidad = '';
       this.localidad.setValue('');
       this.ls.publicado = 'todos';
       this.publicado.setValue('todos', {"estado": "Ver todos", "valor": 'todos'});
       this.eventosService.getEventosFirestore(this.ls.departamento);
    }

    regresar(){
        this.router.navigate(["/lugares/listado"]);
    }

    get departamento() { return this.filtrosForm.get('departamento'); }
    get localidad() {  return this.filtrosForm.get('localidad'); }
    get activos() {  return this.filtrosForm.get('activos'); };
    get publicado() {  return this.filtrosForm.get('publicado'); };
}
