import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormArray, FormGroup } from '@angular/forms';
import { ValidatorService } from '../../../shared/services/validator.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Imagen } from 'src/app/shared/interfaces/imagen.interface'
import { Observable, Subscription } from 'rxjs';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { MapaService } from '../../../shared/services/mapa.service';
import { ConfigService } from '../../../shared/services/config.service';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import 'moment/locale/es';
import { DialogMapaComponent } from '../../../shared/components/dialog-mapa/dialog-mapa.component';
import { Restoran } from '../../interfaces/Restoran.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs/operators';
import { DialogPublicarComponent } from '../../components/dialog-publicar/dialog-publicar.component';
import { doc, setDoc, startAt, Timestamp } from "firebase/firestore";
import { MatDatepicker } from '@angular/material/datepicker';
import { Moment } from 'moment';
import { DondeComerService } from '../../services/donde-comer.service';

@Component({
    selector: 'app-agregar',
    templateUrl: './agregar.component.html',
    styleUrls: ['./agregar.component.css']
})
export class AgregarComponent implements OnInit {

    allowedSizeGallery: number = 150; //kilo bytes
    allowedSizeHome: number = 80; //kilo bytes
    cambiosConfirmados: boolean = false;
    departamentos: string[] = [];
    directorio: string = ''; //subcarpeta con el nombre del lugar
    directorioPadre: string = 'eventos'; //carpeta raíz donde se almacenan los lugares
    heightAllowedEvento: number = 150;
    idEvento: string;
    localidades: string[] = [];
    titulo: string = "Nuevo Restaurante";
    widthAllowedEvento: number = 150;
    private sourceDepartamentos: Subscription;
    private sourceLocalidades: Subscription;
    public prioridades$: Observable<number[]>;
    prioridades: number[] = [];
    private imagenDefault = { "name": "imagen-default", "url": "assets/default-lugar-galeria.jpg" };
    imagenRestaurante: Imagen = this.imagenDefault;
    imagenesBorradas: string[] = []; // solo guarda las imagenes que se eliminaron y no se guardo el formulario

    public restoranForm: FormGroup = this.fb.group({
        carpeta: [null],
        departamento: ['',Validators.required],
        direccion: [''],
        imagen: [this.imagenDefault],
        localidad: ['',[Validators.required]],
        nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        publicado: [false],
        telefonos: this.fb.array([
            this.fb.group({
                numero: ['', [this.vs.validarTelefono]]
            })
        ]),
    });

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private vs: ValidatorService,
        private _snackBar: MatSnackBar,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        private mapaService: MapaService,
        private configService: ConfigService,
        private comerService: DondeComerService,
        private _adapter: DateAdapter<any>,
    ) {

    }

    ngOnInit(): void {
        this.sourceDepartamentos = this.configService.getObsDepartamentos().subscribe(dptos => this.departamentos = dptos)
        this.configService.emitirDepartamentosActivos();
        this.sourceLocalidades = this.configService.getObsLocalidades().subscribe(locs => this.localidades = locs);
        /**
        * A partir de la ruta y el id recibido obtiene el lugar para mostrar 
        */
        this.activatedRoute.params.pipe(
            switchMap(({ id }) => this.comerService.geRestoranId(id))
            //    tap(res => console.log(res))
        ).subscribe(restoran => {
            let restoranActual: Restoran = JSON.parse(JSON.stringify(restoran));
            if (restoranActual.id !== undefined) {//Si estamos editando un lugar
                this.idEvento = restoranActual.id;
                delete restoranActual.id //para setear el formulario es necesario quitar el tatributo id
                this.restoranForm.reset(restoranActual);
                this.titulo = `Editando ${this.restoranForm.controls['nombre'].value}`;
                this.imagenRestaurante = restoranActual.imagen;
                this.directorio = this.carpeta.value;
                this.configService.getLocadidadesDepartamento(restoranActual.departamento);
            } else {
            }
        });

        // Si es un lugar nuevo crear un nombre para la carpeta
        if (this.carpeta.value === null) {
            this.directorio = this.comerService.randomString(7);
            this.carpeta.setValue(this.directorio);
        }
    }

    ngAfterViewInit(): void {
        //es para que no se vea el error de cambio
        this.cdRef.detectChanges();
    }

    OnDestroy(): void {
        this.sourceDepartamentos.unsubscribe();
        this.sourceLocalidades.unsubscribe();

    }

    /**
     * Función para prevenir la publicación de un lugar sin los datos indispensables
     * para la app
     */
    switchPublicar() {
        let test: boolean = true;
        let _imagen: string = "OK";
        let _ubicacion: string = "OK";
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
                    ubicacion: _ubicacion,
                    descripcion: _descripcion
                },
            });
        }
    }

    regresar() {
        this.router.navigate(['/eventos/listado']);
    }

    /**
     * Al cambiar la imagen del evento, asigna el valor recibido a  la variable imagenEvento del formulario.
     * @param $event - Contiene los datos de la imágen subida para el evento.
     * Los datos son la url y el nombre del archivo. 
     */
    setImagenRestaurante($event) {
        if ($event != "") {
            this.imagenRestaurante = $event;
        } else {
            this.imagenRestaurante = this.imagenDefault;
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
    async submitEvento() {
        if (this.publicado.value === true) {
            this.switchPublicar();
        }
        //envia el formulario
        this.restoranForm.controls['imagen'].setValue(this.imagenRestaurante);
        if (this.restoranForm.valid) {
            this.cambiosConfirmados = true;
            //verifica si es una actualización o un evento nuevo
            if (this.idEvento !== undefined) {//si se esta editando un lugar
                //this.lugaresService.updateLugar(this.lugarForm.value, this.idLugar);
                const restauran: Restoran = this.restoranForm.value;
                restauran.id = this.idEvento;
                this.comerService.updateRestoranLocal(restauran);
                this.comerService.updateRestoranFirestore(this.restoranForm.value, this.idEvento)
                    .then(res => {
                        this.openSnackBarSubmit('¡El evento se ha actualizado correctamente!');
                    })
                    .catch(error => {
                        this.openSnackBarSubmit('¡Error, no se ha podido actualizar el evento en Firestore!');
                        console.error('¡Error, no se ha podido actualizar el lugar en Firestore!. Error: ' + error);
                    });
                //limpia el mapa y el mini-mapa
                this.mapaService.resetDataMapa();
                this.mapaService.resetDataMiniMapa();
                //Limpia el minimapa y el mapa
                this.mapaService.emitirMiniMapa();
                this.mapaService.resetDataMapa();
                this.regresar();
            } else { //Si el lugar es nuevo
                let nuevoId: string;
                this.comerService.addRestoran(this.restoranForm.value).then(id => {
                    nuevoId = id
                    if (nuevoId !== '' && nuevoId !== undefined) {
                        this.openSnackBarSubmit('¡El nuevo evento se ha guardado correctamente con el ID: ' + nuevoId);
                    }
                }).catch(error => {
                    console.log(error);
                    this.openSnackBarSubmit('¡Por algún motivo el nuevo evento no se pudo gardar!');
                })
                //limpia el formulario y setea los valores inicales con el metodo reset
                this.restoranForm.reset({
                    imagen: this.imagenDefault,
                });
                this.regresar();
            }
        }
    }

    /**
     * Función que agrega un nuevo formControl de tipo telefono
     */
    agregarNuevoTelefonoAlFormulario() {
        const telefonosControl = this.restoranForm.get('telefonos') as FormArray;
        telefonosControl.push(
            this.fb.group({
                numero: ['', [Validators.minLength(8), Validators.maxLength(9)]]
            })
        )
    }

    eliminarTelefonoDelFormulario(i: number) {
        const telefonosControl = this.restoranForm.get('telefonos') as FormArray;
        telefonosControl.removeAt(i);
    }

    // Getters
    get carpeta() { return this.restoranForm.get('carpeta'); }
    get departamento() { return this.restoranForm.get('departamento'); }
    get direccion() { return this.restoranForm.get('direccion'); }
    get imagen() { return this.restoranForm.get('imagen') };
    get localidad() { return this.restoranForm.get('localidad'); }
    get nombre() { return this.restoranForm.get('nombre'); }
    get publicado() { return this.restoranForm.get('publicado'); }
    get telefonos() { return this.restoranForm.get('telefonos') as FormArray; }
}
