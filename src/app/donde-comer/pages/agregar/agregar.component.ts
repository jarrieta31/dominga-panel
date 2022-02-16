import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup, FormControl } from '@angular/forms';
import { ValidatorService } from '../../../shared/services/validator.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Imagen } from 'src/app/shared/interfaces/imagen.interface'
import { Observable, Subscription, Subject } from 'rxjs';
import { ConfigService } from '../../../shared/services/config.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Restoran } from '../../interfaces/Restoran.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap, takeUntil } from 'rxjs/operators';
import { DialogPublicarComponent } from '../../components/dialog-publicar/dialog-publicar.component';
import { DondeComerService } from '../../services/donde-comer.service';
import { MapaService } from '../../../shared/services/mapa.service';
import { DialogMapaComponent } from 'src/app/shared/components/dialog-mapa/dialog-mapa.component';

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
    directorioPadre: string = 'donde_comer'; //carpeta raíz donde se almacenan los lugares
    heightAllowedEvento: number = 150;
    idRestoran: string;
    localidades: string[] = [];
    titulo: string = "Nuevo Restaurante";
    direccionMinLength: number = 3;
    direccionMaxLength: number = 20;
    nombreMinLength: number = 3;
    nombreMaxLength: number = 20;
    mapaTouched: boolean = false;
    widthAllowedEvento: number = 150;
    restaurantes: Restoran[] = [];
    prioridades: number[] = [];
    private imagenDefault = { "name": "imagen-default", "url": "assets/default-lugar-galeria.jpg" };
    imagenRestaurante: Imagen = this.imagenDefault;
    imagenesBorradas: string[] = []; // solo guarda las imagenes que se eliminaron y no se guardo el formulario
    disabledAddPhones: boolean = false;
    private unsubscribe$ = new Subject<void>();

    nroWhatsapp: FormControl = this.fb.control(null, [this.vs.valididarNumeroWhatsapp]);

    public restoranForm: FormGroup = this.fb.group({
        carpeta: [null],
        departamento: ['', Validators.required],
        direccion: ['', [Validators.required, Validators.minLength(this.direccionMinLength), Validators.maxLength(this.direccionMaxLength)]],
        imagen: [this.imagenDefault],
        instagram: [null, [this.vs.validarInstagram]],
        localidad: ['', [Validators.required]],
        nombre: ['', [Validators.required, Validators.minLength(this.nombreMinLength), Validators.maxLength(this.nombreMaxLength)]],
        publicado: [false],
        telefonos: this.fb.array([
            this.fb.group({
                numero: ['', [this.vs.validarTelefono]]
            })
        ]),
        whatsapp: [null, [this.vs.valididarWhatsapp]],
        ubicacion: [null ,[this.vs.validarUbicacion, Validators.required]],
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
        private comerService: DondeComerService,
        private mapaService:MapaService,
    ) { }

    ngOnInit(): void {
        this.configService.getObsDepartamentos()
            .pipe( takeUntil( this.unsubscribe$ ) )
            .subscribe(dptos => this.departamentos = dptos)
        this.configService.getObsLocalidades()
            .pipe(takeUntil( this.unsubscribe$ ))
            .subscribe(locs => this.localidades = locs);
        this.comerService.getObsRestaurantes$()
            .pipe( takeUntil(this.unsubscribe$) )
            .subscribe(restaurantes => this.restaurantes = restaurantes);
        this.configService.emitirDepartamentosActivos();
        this.configService.emitirLocalidades();

        /** Observable que se dispara al cambiar el valor del minimapa.
        *  Los datos del formulario cambian en funcion del valor del mimimapa
        */
        this.mapaService.getObsMiniMapa()
            .pipe(takeUntil( this.unsubscribe$ ))
            .subscribe(res => {
            //si los datos del minimapa son validos y tiene marcado en true
            if (res !== undefined && res.marcador === true) {
                this.ubicacion.setValue(res.centro);
            }
            else if (res.marcador === false) {
                this.ubicacion.setValue(null);
            }
            console.log(JSON.stringify(res));
        });

        /**
        * A partir de la ruta y el id recibido obtiene el lugar para mostrar 
        */
        this.activatedRoute.params.pipe(
            switchMap(({ id }) => this.comerService.geRestoranId(id))
            //    tap(res => console.log(res))
        ).subscribe(restoran => {
            let restoranActual: Restoran = JSON.parse(JSON.stringify(restoran));
            if (restoranActual.id !== undefined) {//Si estamos editando un lugar
                this.idRestoran = restoranActual.id;
                delete restoranActual.id //para setear el formulario es necesario quitar el tatributo id
                for (let i = 0; i < restoranActual.telefonos.length; i++) {
                    if (i > 0) {
                        this.agregarNuevoTelefonoAlFormulario()
                    }
                }
                this.restoranForm.reset(restoranActual);
                this.setNroWhatsapp(restoranActual.whatsapp);
                this.titulo = `Editando ${this.restoranForm.controls['nombre'].value}`;
                this.imagenRestaurante = restoranActual.imagen;
                this.directorio = this.carpeta.value;
                this.configService.getLocadidadesDepartamento(restoranActual.departamento);
                this.mapaService.dMiniMapa = { centro: restoranActual.ubicacion, zoom: 15, marcador: true };
                this.mapaService.emitirMiniMapa();
            } else {
            }
        });

        // Si es un restoran nuevo crear un nombre para la carpeta
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
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        //limpia el mapa y el mini-mapa
        this.mapaService.resetDataMapa();
        this.mapaService.resetDataMiniMapa();
        //Limpia el minimapa y el mapa
        this.mapaService.emitirMiniMapa();
        this.mapaService.resetDataMapa();
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


    /**
     * Abre el dialog con para el mapa
     */
    abrirMapa() {
        this.mapaTouched = true;
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = true;
        dialogConfig.minHeight = "565px";
        //dialogConfig.minHeight = "450px";
        //dialogConfig.minWidth = "900px";
        dialogConfig.minWidth = "1400px";
        dialogConfig.id = "dialogMapa";
        dialogConfig.data = 0;
        this.dialog.open(DialogMapaComponent, dialogConfig);
    }

    regresar() {
        this.router.navigate(['/donde-comer/listado']);
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

    /** 
     * Esta función toma el número de celular ingresado en el formulario 
     * construye el link para whatsapp y lo setea en el formulario como un enlace.
     */
    setLinkWhatsapp() {
        if (this.nroWhatsapp.valid) {
            let nro: string = this.nroWhatsapp.value;
            nro = nro.slice(1);
            let url: string = 'https://api.whatsapp.com/send?phone=598' + nro;
            this.whatsapp.setValue(url);
        } else {
            this.whatsapp.setValue(null);
        }
    }

    /**
     * Función para obtener el celular a partir del link de whatsapp y mostrar
     * en el formulario solo el número de tetéfono.
     */
    setNroWhatsapp(link:string){
        if ( link !== null) {
            //let enlace: string = this.whatsapp.value
            let celular = "0" + link.slice(39)
            this.nroWhatsapp.setValue(celular)
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
            //verifica si es una actualización o un restoran nuevo
            if (this.idRestoran !== undefined) {//si se esta editando un restoran
                const restauran: Restoran = this.restoranForm.value;
                restauran.id = this.idRestoran;
                this.comerService.updateRestoranLocal(restauran);
                this.comerService.updateRestoranFirestore(this.restoranForm.value, this.idRestoran)
                    .then(res => {
                        this.openSnackBarSubmit('¡El restaurante se ha actualizado correctamente!');
                    })
                    .catch(error => {
                        this.openSnackBarSubmit('¡Error, no se ha podido actualizar el Restaurante en Firestore!');
                        console.error('¡Error, no se ha podido actualizar el Resturante en Firestore!. Error: ' + error);
                    });
                //limpia el mapa y el mini-mapa
                this.mapaService.resetDataMapa();
                this.mapaService.resetDataMiniMapa();
                //Limpia el minimapa y el mapa
                this.mapaService.emitirMiniMapa();
                this.mapaService.resetDataMapa();
                this.regresar();
            } else { //Si el Restoran es nuevo
                let nuevoId: string;
                this.comerService.addRestoran(this.restoranForm.value).then(id => {
                    nuevoId = id
                    if (nuevoId !== '' && nuevoId !== undefined) {
                        this.openSnackBarSubmit('¡El nuevo restaurante se ha guardado correctamente con el ID: ' + nuevoId);
                    }
                }).catch(error => {
                    console.log(error);
                    this.openSnackBarSubmit('¡Por algún motivo el nuevo restaurante no se pudo guardar!');
                })
                //limpia el mapa y el mini-mapa
                this.mapaService.resetDataMapa();
                this.mapaService.resetDataMiniMapa();
                //Limpia el minimapa y el mapa
                this.mapaService.emitirMiniMapa();
                this.mapaService.resetDataMapa();
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
                numero: ['', [this.vs.validarTelefono]]
            })
        )
        this.disabledAddPhones = telefonosControl.length >= 2 ? true : false;
    }

    eliminarTelefonoDelFormulario(i: number) {
        const telefonosControl = this.restoranForm.get('telefonos') as FormArray;
        telefonosControl.removeAt(i);
        this.disabledAddPhones = telefonosControl.length >= 2 ? true : false;
    }

    // Getters
    get carpeta() { return this.restoranForm.get('carpeta'); }
    get departamento() { return this.restoranForm.get('departamento'); }
    get direccion() { return this.restoranForm.get('direccion'); }
    get imagen() { return this.restoranForm.get('imagen') };
    get localidad() { return this.restoranForm.get('localidad'); }
    get nombre() { return this.restoranForm.get('nombre'); }
    get publicado() { return this.restoranForm.get('publicado'); }
    get ubicacion() { return this.restoranForm.get('ubicacion'); }
    get telefonos() { return this.restoranForm.get('telefonos') as FormArray; }
    get whatsapp() { return this.restoranForm.get('whatsapp'); }
    get instagram() { return this.restoranForm.get('instagram'); }
}
