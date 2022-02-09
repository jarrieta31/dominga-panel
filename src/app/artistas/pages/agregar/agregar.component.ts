import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormArray, FormGroup } from '@angular/forms';
import { ValidatorService } from '../../../shared/services/validator.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Imagen } from 'src/app/shared/interfaces/imagen.interface'
import { Observable, Subscription, Subject } from 'rxjs';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ConfigService } from '../../../shared/services/config.service';
import { MatDialog } from '@angular/material/dialog';
import { Artista } from '../../interfaces/artista.interface';
import { ArtistasService } from '../../services/artistas.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { DialogPublicarComponent } from '../../components/dialog-publicar/dialog-publicar.component';

interface Categoria {
    value: string;
    viewValue: string;
}

@Component({
    selector: 'app-agregar',
    templateUrl: './agregar.component.html',
    styleUrls: ['./agregar.component.css']
})
export class AgregarComponent implements OnInit {

    allowedSizeGallery: number = 150; //kilo bytes
    private unsubscribe$ = new Subject<void>();
    allowedSizeHome: number = 80; //kilo bytes
    cambiosConfirmados: boolean = false;
    departamentos: string[] = [];
    directorio: string = ''; //subcarpeta con el nombre del lugar
    directorioPadre: string = 'artistas'; //carpeta raíz donde se almacenan los lugares
    categorias: Categoria[] = [
        { value: "musica", viewValue: "Música" },
        { value: "plastico", viewValue: "Plastico" },
        { value: "fotografia", viewValue: "Fotografía" },
    ];
    heightAllowedArtista: number = 150;
    idArtista: string;
    localidades: string[] = [];
    titulo: string = "Nuevo Artista";
    widthAllowedArtista: number = 150;
    prioridades: number[] = [];
    private imagenDefault = { "name": "imagen-default", "url": "assets/default-lugar-galeria.jpg" };
    imagenArtista: Imagen = this.imagenDefault;
    imagenesBorradas: string[] = []; // solo guarda las imagenes que se eliminaron y no se guardo el formulario

    public artistaForm: FormGroup = this.fb.group({
        carpeta: [null],
        departamento: ['', Validators.required],
        imagen: [this.imagenDefault],
        instagram: [null, [this.vs.validarInstagram]],
        localidad: ['', [Validators.required]],
        nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        publicado: [false],
        categoria: ['', [Validators.required]],
        spotify: [null, [this.vs.validarPlayListSpotify]],
        youtube: [null, [this.vs.validarLinkYoutube]],
    });

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private vs: ValidatorService,
        private _snackBar: MatSnackBar,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        private configService: ConfigService,
        private artistasService: ArtistasService,
    ) {

    }

    ngOnInit(): void {
        
        this.configService.getObsDepartamentos()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(dptos => this.departamentos = dptos)
        this.configService.emitirDepartamentosActivos();
        this.configService.getObsLocalidades()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(locs => this.localidades = locs);

        /**
        * A partir de la ruta y el id recibido obtiene el lugar para mostrar 
        */
        this.activatedRoute.params.pipe(
            switchMap(({ id }) => this.artistasService.getArtistaId(id)),
            //   tap(res => console.log(res))
        ).subscribe(artista => {
            let artistaActual: Artista = JSON.parse(JSON.stringify(artista));
            if (artistaActual.id !== undefined) {//Si estamos editando un artista
                this.idArtista = artistaActual.id;
                delete artistaActual.id //para setear el formulario es necesario quitar el tatributo id
                this.artistaForm.reset(artistaActual);
                this.titulo = `Editando ${this.artistaForm.controls['nombre'].value}`;
                this.imagenArtista = artistaActual.imagen;
                this.directorio = this.carpeta.value;
                this.configService.getLocadidadesDepartamento(artistaActual.departamento);
            }
        });
        // Si es un lugar nuevo crear un nombre para la carpeta
        if (this.carpeta.value === null) {
            this.directorio = this.artistasService.randomString(7);
            this.carpeta.setValue(this.directorio);
        }
    }

    OnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    ngAfterViewInit(): void {
        //es para que no se vea el error de cambio
        this.cdRef.detectChanges();
    }


    /**
     * Función para prevenir la publicación de un lugar sin los datos indispensables
     * para la app
     */
    switchPublicar() {
        let test: boolean = true;
        let _imagen: string = "OK";
        let _descripcion: string = "OK";
        if (this.imagen.value.url === "assets/default-lugar-galeria.jpg") {
            test = false;
            this.publicado.setValue(false);
            _imagen = "No válida"
        }
        if (!test) {
            this.dialog.open(DialogPublicarComponent, {
                data: {
                    imagen: _imagen,
                    descripcion: _descripcion
                },
            });
        }
    }

    regresar() {
        this.router.navigate(['/artistas/listado']);
    }

    /**
     * Al cambiar la imagen del artista, asigna el valor recibido a  la variable imagenArtista del formulario.
     * @param $event - Contiene los datos de la imágen subida para el artista.
     * Los datos son la url y el nombre del archivo. 
     */
    setImagenArtista($event) {
        if ($event != "") {
            this.imagenArtista = $event;
        } else {
            this.imagenArtista = this.imagenDefault;
        }
    }

    quitarEspacios() {

    }


    /** No se está usando ahora
         * Función para mostrar un mensaje corto al usuario 
         * @param message Es el texto que se muestra en el snackBar
         */
    openSnackBarSubmit(message: string) {
        this._snackBar.open(message, "Aceptar", {
            duration: 5000
        });
    }

    /** 
     * Este método es llamado cada vez que se selecciona un departamento
     */
    getLocalidadesPorDepartamento() {
        this.configService.getLocadidadesDepartamento(this.departamento.value)
    }

    /** Enviar en formulario a firebase */
    async submitArtista() {
        if (this.publicado.value === true) {
            this.switchPublicar();
        }
        //envia el formulario
        this.artistaForm.controls['imagen'].setValue(this.imagenArtista);
        if (this.artistaForm.valid) {
            this.cambiosConfirmados = true;
            //verifica si es una actualización o un artista nuevo
            if (this.idArtista !== undefined) {//si se esta editando un lugar
                //this.lugaresService.updateLugar(this.lugarForm.value, this.idLugar);
                const artista: Artista = this.artistaForm.value;
                artista.id = this.idArtista;
                this.artistasService.updateArtistaLocal(artista);
                this.artistasService.updateArtistaFirestore(this.artistaForm.value, this.idArtista)
                    .then(res => {
                        this.openSnackBarSubmit('¡El artista se ha actualizado correctamente!');
                    })
                    .catch(error => {
                        this.openSnackBarSubmit('¡Error, no se ha podido actualizar el artista en Firestore!');
                        console.error('¡Error, no se ha podido actualizar el lugar en Firestore!. Error: ' + error);
                    });
                this.regresar();
            } else { //Si el lugar es nuevo
                let nuevoId: string;
                this.artistasService.addArtista(this.artistaForm.value).then(id => {
                    nuevoId = id
                    if (nuevoId !== '' && nuevoId !== undefined) {
                        this.openSnackBarSubmit('¡El nuevo artista se ha guardado correctamente con el ID: ' + nuevoId);
                        this.regresar();
                    }
                }).catch(error => {
                    console.log(error);
                    this.openSnackBarSubmit('¡Por algún motivo el nuevo artista no se pudo guardar!');
                })
            }
        }
    }

    // Getters
    get carpeta() { return this.artistaForm.get('carpeta'); }
    get departamento() { return this.artistaForm.get('departamento'); }
    get direccion() { return this.artistaForm.get('direccion'); }
    get imagen() { return this.artistaForm.get('imagen'); }
    get instagram() { return this.artistaForm.get('instagram'); }
    get localidad() { return this.artistaForm.get('localidad'); }
    get nombre() { return this.artistaForm.get('nombre'); }
    get publicado() { return this.artistaForm.get('publicado'); }
    get spotify() { return this.artistaForm.get('spotify'); }
    get youtube() { return this.artistaForm.get('youtube'); }

}
