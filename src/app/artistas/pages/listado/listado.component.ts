import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ArtistasService } from '../../services/artistas.service';
import { Artista } from '../../interfaces/artista.interface';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { ConfigService } from '../../../shared/services/config.service';
import { LocalStorageService } from '../../../shared/services/local-storage.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-listado',
    templateUrl: './listado.component.html',
    styleUrls: ['./listado.component.css']
})
export class ListadoComponent implements OnInit {

    titulo: string = "Lista artistas";
    artistas: Artista[];
    publicadoSelec: boolean;
    page: number = 1;
    private unsubscribe$ = new Subject<void>();
    filtrosGuardados = [];
    localidades: string[] = [];
    departamentos: string[] = [];
    opcionesSlectPublicado = [{ "estado": "Publicados", "valor": 'publicados' }, { "estado": "Sin publicar", "valor": 'sinPublicar' }, { "estado": "Ver todos", "valor": 'todos' }];
    filtrosForm: FormGroup = this.fb.group({
        departamento: [this.ls.departamento],
        localidad: [this.ls.localidad],
        publicado: [this.ls.publicado]
    })

    constructor(
        private artistasService: ArtistasService,
        private router: Router,
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private configService: ConfigService,
        private ls: LocalStorageService,
        private title: Title,
    ) { 
        this.title.setTitle(this.titulo)
    }


    ngOnInit(): void {
        this.configService.getObsDepartamentos()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(dptos => { this.departamentos = dptos });
        this.configService.emitirDepartamentosActivos();
        this.configService.getObsLocalidades()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(locs => this.localidades = locs);
        this.configService.emitirLocalidades();
        this.artistasService.getObsArtistas$()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(artistas => this.artistas = artistas);
        this.artistasService.getArtistasFirestore(localStorage.getItem("departamento"));
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    /** 
     * Este método es llamado cada vez que se selecciona un departamento
     */
    setFiltroDepartamento() {
        this.localidad.reset('');
        this.ls.localidad = '';
        this.ls.departamento = this.departamento.value;
        this.configService.getLocadidadesDepartamento(this.ls.departamento);
        this.artistasService.getArtistasFirestore(this.ls.departamento);
    }

    setFiltroLocalidad() {
        this.ls.localidad = this.localidad.value;
        this.artistasService.getArtistasFirestore(this.ls.departamento);
    }

    setFiltroPublicados() {
        this.ls.publicado = this.publicado.value;
        this.artistasService.getArtistasFirestore(this.ls.departamento);
    }

    resetFiltros() {
        this.ls.activos = 'todos';
        this.ls.localidad = '';
        this.localidad.setValue('');
        this.ls.publicado = 'todos';
        this.publicado.setValue('todos', { "estado": "Ver todos", "valor": 'todos' });
        this.artistasService.getArtistasFirestore(this.ls.departamento);
    }

    regresar() {
        this.router.navigate(["/artistas/listado"]);
    }

    get departamento() { return this.filtrosForm.get('departamento'); }
    get localidad() { return this.filtrosForm.get('localidad'); }
    get publicado() { return this.filtrosForm.get('publicado'); };

}
