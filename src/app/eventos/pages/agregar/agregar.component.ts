import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormArray, FormGroup } from '@angular/forms';
import { ValidatorService } from '../../../shared/services/validator.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Imagen } from 'src/app/shared/interfaces/imagen.interface'
import { Observable, Subject, Subscription } from 'rxjs';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { MapaService } from '../../../shared/services/mapa.service';
import { ConfigService } from '../../../shared/services/config.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DateAdapter } from '@angular/material/core';
import { DialogMapaComponent } from '../../../shared/components/dialog-mapa/dialog-mapa.component';
import { Evento } from '../../interfaces/evento.interface';
import { EventosService } from '../../services/eventos.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap, takeUntil } from 'rxjs/operators';
import { DialogPublicarComponent } from '../../components/dialog-publicar/dialog-publicar.component';
import { Timestamp } from "firebase/firestore";
import { Moment } from 'moment';
import * as moment from 'moment';
//import 'moment/locale/es';

@Component({
    selector: 'app-agregar',
    templateUrl: './agregar.component.html',
    styleUrls: ['./agregar.component.css']
})
export class AgregarComponent implements OnInit, AfterViewInit, OnDestroy {

    sizeEvento: number = 80; //kilo bytes
    widthEvento: number = 600;
    heightEvento: number = 450;
    nombreMinLength: number = 0;
    nombreMaxLength: number = 0;
    direccionMaxLength: number = 0;
    direccionMinLength: number = 0;
    descripcionMinLength: number = 0;
    descripcionMaxLength: number = 0;
    anio: number;
    cambiosConfirmados: boolean = false;
    departamentos: string[] = [];
    dia: number;
    directorio: string = ''; //subcarpeta con el nombre del lugar
    directorioPadre: string = 'eventos'; //carpeta raíz donde se almacenan los lugares
    eventosTipos: string[] = [];
    fechaHora: Date;
    idEvento: string;
    localidades: string[] = [];
    mapaTouched: boolean = false;
    mes: number;
    meses: string[] = [];
    minDate: Moment = moment();
    minDateFin: Moment;
    monedas = [{ tipo: "$" }, { tipo: "U$S" }];
    precioU: boolean = false;
    startDate: Moment;
    startDateEnd: Moment;
    titulo: string = "Nuevo Evento";
    private destroy$ = new Subject<void>();
    public prioridades$: Observable<number[]>;
    prioridades: number[] = [];
    private imagenDefault = { "name": "imagen-default", "url": "assets/default-lugar-galeria.jpg" };
    imagenEvento: Imagen = this.imagenDefault;
    imagenesBorradas: string[] = []; // solo guarda las imagenes que se eliminaron y no se guardo el formulario

    ubicacionManual: FormControl = this.fb.control(null, [this.vs.validarCoordenadas]);

    nroWhatsapp: FormControl = this.fb.control(null, [this.vs.valididarNumeroWhatsapp]);

    public eventoForm: FormGroup;
    pickerFechIni: FormControl = this.fb.control(null);
    pickerFechEnd: FormControl = this.fb.control(null);


    editorConfig: AngularEditorConfig = {
        editable: true,
        spellcheck: true,
        height: '15rem',
        minHeight: '5rem',
        placeholder: 'Ingresa una descripción del evento...',
        translate: 'no',
        defaultParagraphSeparator: 'p',
        toolbarHiddenButtons: [
            [
                'subscript',
                'superscript',
                'strikeThrough',
                'fontName',
            ],
            [
                'textColor',
                'backgroundColor',
                // 'link',
                //'unlink',
                'fontSize',
                'insertImage',
                'insertVideo',
            ]
        ],
        customClasses: [
            {
                name: "quote",
                class: "quote",
            },
            {
                name: 'redText',
                class: 'redText'
            },
            {
                name: "titleText",
                class: "titleText",
                tag: "h1",
            },
        ]
    };

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
        private eventosService: EventosService,
        private _adapter: DateAdapter<Moment>,
    ) {

        this.heightEvento = this.configService.heightEvento;
        this.widthEvento = this.configService.widthEvento;
        this.sizeEvento = this.configService.sizeEvento;
        this.nombreMinLength = this.configService.nombreMinLength;
        this.nombreMaxLength = this.configService.nombreMaxLength;
        this.direccionMinLength = this.configService.direccionMinLength;
        this.direccionMaxLength = this.configService.direccionMaxLength;
        this.descripcionMinLength = this.configService.eventoDescripcionMinLength;
        this.descripcionMaxLength = this.configService.eventoDescripcionMaxLength;

        this.eventoForm = this.fb.group({
            carpeta: [null],
            departamento: ['', Validators.required],
            descripcion: ['', [Validators.minLength(this.descripcionMinLength), Validators.maxLength(this.descripcionMaxLength)]],
            direccion: ['', [Validators.minLength(this.direccionMinLength), Validators.maxLength(this.direccionMaxLength)]],
            facebook: [null, [this.vs.validarFacebook]],
            fechaFin: [null],
            fechaInicio: [null],
            imagen: [this.imagenDefault],
            instagram: [null, [this.vs.validarInstagram]],
            localidad: ['', [Validators.required]],
            lugar: ['', [Validators.required, Validators.minLength(this.nombreMinLength), Validators.maxLength(this.nombreMaxLength)]],
            moneda: [this.monedas[0].tipo, [Validators.required]],
            nombre: ['', [Validators.required, Validators.minLength(this.nombreMinLength), Validators.maxLength(this.nombreMaxLength)]],
            precio: [0, [Validators.required, Validators.min(0)]],
            precioUnico: [true],
            publicado: [false],
            tickAntel: [null, [this.vs.validarTickAntel]],
            tipo: ['', [Validators.required]],
            ubicacion: [null, [this.vs.validarUbicacion, Validators.required]],
            whatsapp: [null, [this.vs.valididarWhatsapp]],
        });


        /** Observable que se dispara al cambiar el valor del minimapa.
        *  Los datos del formulario cambian en funcion del valor del mimimapa
        */
        this.mapaService.getObsMiniMapa().pipe(takeUntil(this.destroy$))
            .subscribe(res => {
                //si los datos del minimapa son validos y tiene marcado en true
                if (res !== undefined && res.marcador === true) {
                    this.ubicacion.setValue(res.centro);
                }
                else if (res.marcador === false) {
                    this.ubicacion.setValue(null);
                }
            });
    }

    ngOnInit(): void {
        this._adapter.setLocale('es');
        this.pickerFechEnd.disable();
        this.configService.getObsDepartamentos().pipe(takeUntil(this.destroy$)).subscribe(dptos => this.departamentos = dptos)
        this.configService.getObsLocalidades().pipe(takeUntil(this.destroy$)).subscribe(locs => this.localidades = locs);
        this.configService.getObsTiposEventos().pipe(takeUntil(this.destroy$)).subscribe(eventosTipos => this.eventosTipos = eventosTipos);
        this.configService.emitirTiposEventos();
        this.configService.emitirDepartamentosActivos();

        /**
        * A partir de la ruta y el id recibido obtiene el lugar para mostrar 
        */
        this.activatedRoute.params.pipe(
            switchMap(({ id }) => this.eventosService.getEventoId(id)),
            //    tap(res => console.log(res))
            takeUntil(this.destroy$),
        ).subscribe(evento => {
            let eventoActual: Evento = JSON.parse(JSON.stringify(evento));
            if (eventoActual.id !== undefined) {//Si estamos editando un lugar
                if (evento.fechaInicio !== null && evento.fechaInicio !== undefined) {
                    let fInicio = moment(evento.fechaInicio.seconds * 1000);
                    this.minDateFin = fInicio;
                    this.pickerFechIni.setValue(fInicio);
                    this.pickerFechEnd.enable();
                    if (evento.fechaFin !== null && evento.fechaFin !== undefined) {
                        let fFin = moment(evento.fechaFin.seconds * 1000);
                        this.pickerFechEnd.setValue(fFin);
                    }
                }
                this.idEvento = eventoActual.id;
                delete eventoActual.id //para setear el formulario es necesario quitar el tatributo id
                this.eventoForm.reset(eventoActual);
                this.titulo = `Editando ${this.eventoForm.controls['nombre'].value}`;
                this.imagenEvento = eventoActual.imagen;
                this.directorio = this.carpeta.value;
                this.configService.getLocadidadesDepartamento(eventoActual.departamento);
                this.mapaService.dMiniMapa = { centro: eventoActual.ubicacion, zoom: 15, marcador: true };
                this.mapaService.emitirMiniMapa();
            } else {
                this.startDate = moment();
            }
        });
        // Si es un lugar nuevo crear un nombre para la carpeta
        if (this.carpeta.value === null) {
            this.directorio = this.eventosService.randomString(7);
            this.carpeta.setValue(this.directorio);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        //limpia el mapa y el mini-mapa
        this.mapaService.resetDataMapa();
        this.mapaService.resetDataMiniMapa();
    }

    ngAfterViewInit(): void {
        if (this.pickerFechIni.value !== null && this.pickerFechEnd.value !== null) {
            this.setFechaStart();
            this.setFechaEnd();
        }
        //es para que no se vea el error de cambio
        this.cdRef.detectChanges();

    }

    /** Función que toma las coordenadas ingresadas en formato google Maps las transforma
     * y crea el marcador en el miniMapa y guarda la ubicación para el formulario.
     */
    setUbicacionManual() {
        if (this.ubicacionManual.valid) {
            let coordsStr: string = this.ubicacionManual.value;
            let arrCoords = coordsStr.split(',');
            let latitud = Number(arrCoords[0].trim());
            let longitud = Number(arrCoords[1].trim());
            console.log("latitud: ", latitud)
            console.log("longitud: ", longitud);
            this.ubicacion.setValue({ "lng": longitud, "lat": latitud });
            this.mapaService.dMiniMapa = { centro: { lng: longitud, lat: latitud }, zoom: 15, marcador: true };
            this.mapaService.emitirMiniMapa();
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
     * Funcion que toma la fecha de inicio ingresada y setea los valores inical y el mínimo que se puede seleccionar
     * en el datepicker de fecha final.
     * También habilita el input de la hora y el datepicker de fecha final
     */
    setFechaStart() {
        if (this.pickerFechEnd.value === null || this.pickerFechEnd.value < this.pickerFechIni.value) {
            this.startDateEnd = this.pickerFechIni.value; //fecha inicial del picker pickerFechEnd
            this.pickerFechEnd.setValue(this.pickerFechIni.value);
        }
        if (this.pickerFechIni.value !== null) {
            const fechaHoraStart: Moment = this.pickerFechIni.value;
            const fechaStr: string = `${fechaHoraStart.format('YYYY-MM-DD HH:mm:ss')} UTC${fechaHoraStart.format('Z')}`;
            this.fechaInicio.setValue(Timestamp.fromDate(new Date(fechaStr)));
        }
        this.minDateFin = this.pickerFechIni.value.clone(); //fecha mínima del picker pickerFechEnd
        this.pickerFechEnd.enable();
    }

    setFechaEnd() {
        if (this.pickerFechEnd.value >= this.pickerFechIni.value && this.pickerFechEnd.value !== null) {
            const fechaHoraEnd: Moment = this.pickerFechEnd.value.clone();
            let fechaStr: string = `${fechaHoraEnd.format('YYYY-MM-DD HH:mm:ss')} UTC${fechaHoraEnd.format('Z')}`;
            this.fechaFin.setValue(Timestamp.fromDate(new Date(fechaStr)));
        } else {
            this.startDateEnd = this.pickerFechIni.value; //fecha inicial del picker pickerFechEnd
            this.pickerFechEnd.setValue(this.pickerFechIni.value);
        }
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
        let _fechaInicio: string = "OK";
        let _fechaFin: string = "OK";
        if (this.imagen.value.url === "assets/default-lugar-galeria.jpg") {
            test = false;
            this.publicado.setValue(false);
            _imagen = "No válida"
        }
        if (this.descripcion.value.length < 100) {
            test = false;
            this.publicado.setValue(false);
            _descripcion = "No válida"
        }
        if (this.ubicacion.value === null) {
            test = false;
            this.publicado.setValue(false);
            _ubicacion = "No válida"
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
    setImagenEvento($event) {
        if ($event != "") {
            this.imagenEvento = $event;
        } else {
            this.imagenEvento = this.imagenDefault;
        }
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

    /** Enviar en formulario a firebase */
    async submitEvento() {
        if (this.publicado.value === true) {
            this.switchPublicar();
        }
        //envia el formulario
        this.eventoForm.controls['imagen'].setValue(this.imagenEvento);
        if (this.eventoForm.valid) {
            this.cambiosConfirmados = true;
            //verifica si es una actualización o un evento nuevo
            if (this.idEvento !== undefined) {//si se esta editando un lugar
                //this.lugaresService.updateLugar(this.lugarForm.value, this.idLugar);
                const evento: Evento = this.eventoForm.value;
                evento.id = this.idEvento;
                this.eventosService.updateEventoLocal(evento);
                this.eventosService.updateEventoFirestore(this.eventoForm.value, this.idEvento)
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
                this.eventosService.addEvento(this.eventoForm.value).then(id => {
                    nuevoId = id
                    if (nuevoId !== '' && nuevoId !== undefined) {
                        this.openSnackBarSubmit('¡El nuevo evento se ha guardado correctamente con el ID: ' + nuevoId);
                    }
                }).catch(error => {
                    console.log(error);
                    this.openSnackBarSubmit('¡Por algún motivo el nuevo evento no se pudo gardar!');
                })
                //limpia el formulario y setea los valores inicales con el metodo reset
                this.eventoForm.reset({
                    imagen: this.imagenDefault,
                });
                //limpia el mapa y el mini-mapa
                this.mapaService.resetDataMapa();
                this.mapaService.resetDataMiniMapa();
                //Limpia el minimapa y el mapa
                this.mapaService.emitirMiniMapa();
                this.mapaService.resetDataMapa();
                this.regresar();
            }
        }
    }


    /**
     * Función para quitar los espacios en blanco del campo nombre. 
     */
    clearNombre() {
        let _nombre: string = this.nombre.value;
        _nombre = _nombre.trim();
        this.nombre.setValue(_nombre);
        console.log(_nombre)
    }

    /**
     * Función para quitar los espacios en blanco del campo lugar. 
     */
    clearNombreLugar() {
        let _nombre: string = this.lugar.value;
        _nombre = _nombre.trim();
        this.lugar.setValue(_nombre);
    }

    /**
     * Función para quitar los espacios en blanco del campo dirección.  
     */
    clearDireccion() {
        let _direccion: string = this.direccion.value;
        _direccion = _direccion.trim();
        this.direccion.setValue(_direccion);
    }

    /**
     * Función para quitar los espacios en blanco del campo tickAntel.  
     */
    clearTickAntel() {
        let _link: string = this.tickAntel.value;
        _link = _link.trim();
        this.tickAntel.setValue(_link);
    }

    /**
     * Función para quitar los espacios en blanco del campo facebook.  
     */
    clearFacebook() {
        let _link: string = this.facebook.value;
        _link = _link.trim();
        this.facebook.setValue(_link);
    }

    /**
     * Función para quitar los espacios en blanco del campo whatsapp.  
     */
    clearWhatsapp() {
        let _link: string = this.nroWhatsapp.value;
        _link = _link.trim();
        this.nroWhatsapp.setValue(_link);
    }

    /**
     * Función para quitar los espacios en blanco del campo instagram.  
     */
    clearInstagram() {
        let _link: string = this.instagram.value;
        _link = _link.trim();
        this.instagram.setValue(_link);
    }



    // Getters
    get carpeta() { return this.eventoForm.get('carpeta'); }
    get departamento() { return this.eventoForm.get('departamento'); }
    get descripcion() { return this.eventoForm.get('descripcion'); }
    get direccion() { return this.eventoForm.get('direccion'); }
    get facebook() { return this.eventoForm.get('facebook'); }
    get fechaFin() { return this.eventoForm.get('fechaFin'); }
    get fechaInicio() { return this.eventoForm.get('fechaInicio'); }
    get imagen() { return this.eventoForm.get('imagen'); }
    get instagram() { return this.eventoForm.get('instagram'); }
    get localidad() { return this.eventoForm.get('localidad'); }
    get lugar() { return this.eventoForm.get('lugar'); }
    get nombre() { return this.eventoForm.get('nombre'); }
    get precio() { return this.eventoForm.get('precio'); }
    get publicado() { return this.eventoForm.get('publicado'); }
    get tickAntel() { return this.eventoForm.get('tickAntel'); }
    get ubicacion() { return this.eventoForm.get('ubicacion'); }
    get whatsapp() { return this.eventoForm.get('whatsapp'); }

}
