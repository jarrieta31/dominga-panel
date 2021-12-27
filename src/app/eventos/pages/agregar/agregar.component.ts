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
import { Evento } from '../../interfaces/evento.interface';
import { EventosService } from '../../services/eventos.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs/operators';
import { DialogPublicarComponent } from '../../components/dialog-publicar/dialog-publicar.component';
import { doc, setDoc, startAt, Timestamp } from "firebase/firestore";
import { MatDatepicker } from '@angular/material/datepicker';
import { Moment } from 'moment';

@Component({
    selector: 'app-agregar',
    templateUrl: './agregar.component.html',
    styleUrls: ['./agregar.component.css']
})
export class AgregarComponent implements OnInit {

    startDate: Date;
    minDate = new Date();
    maxDate = new Date(2050, 1, 1);
    meses: string[] = [];
    titulo: string = "Nuevo Evento";
    allowedSizeGallery: number = 150; //kilo bytes
    allowedSizeHome: number = 80; //kilo bytes
    cambiosConfirmados: boolean = false;
    departamentos: string[] = [];
    directorio: string = ''; //subcarpeta con el nombre del lugar
    dia: number;
    mes: number;
    anio: number;
    idEvento: string;
    directorioPadre: string = 'eventos'; //carpeta raíz donde se almacenan los lugares
    fechaHora: Date;
    heightAllowedGallery: number = 450;
    localidades: string[] = [];
    mapaTouched: boolean = false;
    prioridadAnterior: number;
    tituloUploaderGaleria: string = "Subir imágenes a la galería";
    tituloUploaderHome: string = "Selecciona la imágen del Home";
    eventoTipo = [{ tipo: "Teatro" }, { tipo: "Danza" }, { tipo: "Música" }, { tipo: "Deportes" }, { tipo: "Otros" }];
    widthAllowedGallery: number = 600;
    private sourceDepartamentos: Subscription;
    private sourceLocalidades: Subscription;
    private sourceMiniMapa: Subscription;
    public prioridades$: Observable<number[]>;
    prioridades: number[] = [];
    private imagenDefault = { "name": "imagen-default", "url": "assets/default-lugar-galeria.jpg" };
    imagenEvento: Imagen = this.imagenDefault;
    imagenesBorradas: string[] = []; // solo guarda las imagenes que se eliminaron y no se guardo el formulario

    public eventoForm: FormGroup = this.fb.group({
        carpeta: [null],
        departamento: [''],
        descripcion: ['', [Validators.minLength(60), Validators.maxLength(4900)]],
        direccion: [''],
        facebook: [null, [this.vs.validarFacebook]],
        fecha: [null],
        imagen: [this.imagenDefault],
        instagram: [null, [this.vs.validarInstagram]],
        localidad: [''],
        lugar: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
        nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        publicado: [false],
        ticktAntel: [null],
        tipo: [''],
        ubicacion: [null, [this.vs.validarUbicacion, Validators.required]],
        whatsapp: [null, [this.vs.valididarWhatsapp]],
    });

    fechaIn: FormControl = this.fb.control('');
    horaIn: FormControl = this.fb.control('');


    editorConfig: AngularEditorConfig = {
        editable: true,
        spellcheck: true,
        height: '15rem',
        minHeight: '5rem',
        placeholder: 'Ingresa una descripción del evento...',
        translate: 'no',
        defaultParagraphSeparator: 'p',
        defaultFontName: 'Arial',
        toolbarHiddenButtons: [
            [
                'subscript',
                'superscript',
                'strikeThrough',
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
        private _adapter: DateAdapter<any>,
    ) {

        /** Observable que se dispara al cambiar el valor del minimapa.
        *  Los datos del formulario cambian en funcion del valor del mimimapa
        */
        this.sourceMiniMapa = this.mapaService.getObsMiniMapa().subscribe(res => {
            //si los datos del minimapa son validos y tiene marcado en true
            if (res !== undefined && res.marcador === true) {
                this.ubicacion.setValue(res.centro);
            }
            else if (res.marcador === false) {
                this.ubicacion.setValue(null);
            }
            console.log(JSON.stringify(res));
        });
    }

    ngOnInit(): void {
        this._adapter.setLocale('es');
        this.horaIn.disable();
        this.sourceDepartamentos = this.configService.getObsDepartamentos().subscribe(dptos => this.departamentos = dptos)
        this.configService.emitirDepartamentosActivos();
        this.sourceLocalidades = this.configService.getObsLocalidades().subscribe(locs => this.localidades = locs);
        /**
        * A partir de la ruta y el id recibido obtiene el lugar para mostrar 
        */
        this.activatedRoute.params.pipe(
            switchMap(({ id }) => this.eventosService.getEventoId(id)),
            //    tap(res => console.log(res))
        ).subscribe(evento => {
            let eventoActual: Evento = JSON.parse(JSON.stringify(evento));
            if (eventoActual.id !== undefined) {//Si estamos editando un lugar
                let fechaEvento = new Date(evento.fecha.seconds * 1000);
                let anioEvento = fechaEvento.getFullYear();
                let diaEvento = fechaEvento.getDate();
                let mesEvento = fechaEvento.getMonth();
                this.startDate = new Date(anioEvento, mesEvento, diaEvento);
                console.log(fechaEvento.getUTCHours())
                this.fechaIn.setValue(this.startDate);
                this.horaIn.setValue(this.getHoraStr(fechaEvento.getHours(), fechaEvento.getMinutes()));
                this.horaIn.enable();
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
                this.startDate = new Date();
            }
        });
        // Si es un lugar nuevo crear un nombre para la carpeta
        if (this.carpeta.value === null) {
            this.directorio = this.eventosService.randomString(7);
            this.carpeta.setValue(this.directorio);
        }
    }

    OnDestroy(): void {
        this.sourceDepartamentos.unsubscribe();
        this.sourceLocalidades.unsubscribe();
    }

    ngAfterViewInit(): void {
        //es para que no se vea el error de cambio
        this.cdRef.detectChanges();

    }

    setFecha() {
        let d:Moment = this.fechaIn.value;
        console.log(d)
        this.horaIn.enable();
    }

    setHora() {
        let fecha = this.getFechaStr(this.fechaIn.value);
        let fechaStr: string = `${fecha} ${this.horaIn.value}:00 UTC-0300`;
        this.fecha.setValue(Timestamp.fromDate(new Date(fechaStr)));
    }

    /**
     * Recibe la hora y los minutos en formato numúmerico y la convierte a formato string retornando "hh:mm".
     * Este función sirve para setear y mostrar la hora en el formulario.
     * @param _hora Hora en formato numérico.
     * @param _minutos Minutos en formato numérico. 
     * @returns  Retorna la hora en el siguiente formato "hh:mm" no muestra los segundos.
     */
    getHoraStr( _hora: number, _minutos:number ): string{
        const horas: string[] = [];
        const minutos: string[] = [];
        //crear el array de horas
        for (let i = 0; i < 24; i++) { horas[i] = (i < 10) ? `0${i}` : `${i}` }
        //crear el array de minutos
        for (let i = 0; i < 60; i++) { minutos[i] = (i < 10) ? `0${i}` : `${i}` }
        let h = horas[_hora];
        let m = minutos[_minutos];
        return  `${h}:${m}`;
    }

    /**
     * Recibe la fecha en un objeto Momente y retorna la fecha en string para poder usarla al crear la fecha del evento
     * para enviar.
     * @param _date Es la fecha y la obtenida del datapicker 
     * @returns 
     */
    getFechaStr(_date: Moment): string {
        const dias: string[] = [];
        const meses: string[] = [];
        for(let i = 1; i <= 31; i++){ dias[i] = ( i < 10 ) ? `0${i}` : `${i}` }
        for(let i = 0; i < 12; i++){ meses[i] = ( i < 9 ) ? `0${(i+1)}` : `${(i+1)}` }
        let dd: string = dias[_date.date()];
        let mm: string = meses[_date.month()];
        let yyyy: string =  `${_date.year()}`;
        return `${yyyy}/${mm}/${dd}`;
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
                this.regresar();
            } else { //Si el lugar es nuevo
                let nuevoId: string;
                this.eventosService.addLugar(this.eventoForm.value).then(id => {
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

    // Getters
    get carpeta() { return this.eventoForm.get('carpeta'); }
    get departamento() { return this.eventoForm.get('departamento'); }
    get descripcion() { return this.eventoForm.get('descripcion'); }
    get direccion() { return this.eventoForm.get('direccion'); }
    get facebook() { return this.eventoForm.get('facebook'); }
    get fecha() { return this.eventoForm.get('fecha'); }
    get imagen() { return this.eventoForm.get('imagen'); }
    get instagram() { return this.eventoForm.get('instagram'); }
    get localidad() { return this.eventoForm.get('localidad'); }
    get nombre() { return this.eventoForm.get('nombre'); }
    get nombreLugar() { return this.eventoForm.get('nombreLugar'); }
    get publicado() { return this.eventoForm.get('publicado'); }
    get ticktAntel() { return this.eventoForm.get('ticktAntel'); }
    get ubicacion() { return this.eventoForm.get('ubicacion'); }
    get whatsapp() { return this.eventoForm.get('whatsapp'); }

}
