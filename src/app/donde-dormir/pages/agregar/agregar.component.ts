import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup, FormControl } from '@angular/forms';
import { ValidatorService } from '../../../shared/services/validator.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Imagen } from 'src/app/shared/interfaces/imagen.interface'
import { Subscription, Subject } from 'rxjs';
import { ConfigService } from '../../../shared/services/config.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Hotel } from '../../interfaces/hotel.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap, takeUntil } from 'rxjs/operators';
import { DialogPublicarComponent } from '../../components/dialog-publicar/dialog-publicar.component';
import { DondeDormirService } from '../../services/donde-dormir.service';
import { MapaService } from '../../../shared/services/mapa.service';
import { DialogMapaComponent } from '../../../shared/components/dialog-mapa/dialog-mapa.component';
import { MatGridTileHeaderCssMatStyler } from '@angular/material/grid-list';
import { Telefono } from '../../../shared/interfaces/telefono.interface';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-agregar',
    templateUrl: './agregar.component.html',
    styleUrls: ['./agregar.component.css']
})
export class AgregarComponent implements OnInit, OnDestroy {

    sizeDormir: number = 0; //kilo bytes
    widthDormir: number = 0;
    heightDormir: number = 0;
    nombreMinLength: number = 0;
    nombreMaxLength: number = 0;
    direccionMinLength: number = 0;
    direccionMaxLength: number = 0;
    cambiosConfirmados: boolean = false;
    departamentos: string[] = [];
    directorio: string = ''; //subcarpeta con el nombre del lugar
    directorioPadre: string = 'donde_dormir'; //carpeta raíz donde se almacenan los lugares
    idHotel: string;
    localidades: string[] = [];
    titulo: string = "Nuevo hotel";
    hoteles: Hotel[] = [];
    nroWhatsapp: FormControl = this.fb.control(null, [this.vs.valididarNumeroWhatsapp]);
    prioridades: number[] = [];
    private imagenDefault = { "name": "imagen-default", "url": "assets/default-lugar-galeria.jpg" };
    imagenRestaurante: Imagen = this.imagenDefault;
    mapaTouched: boolean = false;
    imagenesBorradas: string[] = []; // solo guarda las imagenes que se eliminaron y no se guardo el formulario
    disabledAddPhones: boolean = false;
    private destroy$ = new Subject<void>();

    public hotelForm: FormGroup;

    ubicacionManual: FormControl = this.fb.control(null, [this.vs.validarCoordenadas]);

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private vs: ValidatorService,
        private _snackBar: MatSnackBar,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        private configService: ConfigService,
        private dormirService: DondeDormirService,
        private mapaService: MapaService,
        private title: Title,
    ) {
        this.title.setTitle(this.titulo);
        this.heightDormir = this.configService.heightDormir;
        this.widthDormir = this.configService.widthDormir;
        this.sizeDormir = this.configService.sizeDormir;
        this.nombreMinLength = this.configService.nombreMinLength;
        this.nombreMaxLength = this.configService.nombreMaxLength;
        this.direccionMinLength = this.configService.direccionMinLength;
        this.direccionMaxLength = this.configService.direccionMaxLength;

        this.hotelForm = this.fb.group({
            carpeta: [null],
            departamento: ['', Validators.required],
            direccion: ['', [Validators.required, Validators.minLength(this.direccionMinLength), Validators.maxLength(this.direccionMaxLength)]],
            imagen: [this.imagenDefault],
            localidad: ['', [Validators.required]],
            nombre: ['', [Validators.required, Validators.minLength(this.nombreMinLength), Validators.maxLength(this.nombreMaxLength)]],
            publicado: [false],
            telefonos: this.fb.array([
                this.fb.group({
                    numero: [null, [this.vs.validarTelefono]]
                })
            ]),
            ubicacion: [null, [Validators.required, this.vs.validarUbicacion]],
            whatsapp: [null, [this.vs.valididarWhatsapp]],
            instagram: [null, [this.vs.validarInstagram]],
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
        this.configService.getObsDepartamentos().pipe(takeUntil(this.destroy$))
            .subscribe(dptos => this.departamentos = dptos)
        this.configService.getObsLocalidades().pipe(takeUntil(this.destroy$))
            .subscribe(locs => this.localidades = locs);
        this.dormirService.getObsHoteles$().pipe(takeUntil(this.destroy$))
            .subscribe(hoteles => this.hoteles = hoteles);
        this.configService.emitirDepartamentosActivos();
        this.configService.emitirLocalidades();

        /**
        * A partir de la ruta y el id recibido obtiene el lugar para mostrar 
        */
        this.activatedRoute.params.pipe(
            switchMap(({ id }) => this.dormirService.geHotelId(id)),
            takeUntil(this.destroy$),
        ).subscribe(hotel => {
            let hotelActual: Hotel = JSON.parse(JSON.stringify(hotel));
            if (hotelActual.id !== undefined) {//Si estamos editando un lugar
                this.title.setTitle("Editar hotel")
                this.idHotel = hotelActual.id;
                delete hotelActual.id //para setear el formulario es necesario quitar el tatributo id
                for (let i = 0; i < hotelActual.telefonos.length; i++) {
                    if (i > 0) {
                        this.agregarNuevoTelefonoAlFormulario()
                    }
                }
                this.hotelForm.reset(hotelActual);
                this.titulo = `Editando ${this.hotelForm.controls['nombre'].value}`;
                //               this.latitud.setValue(this.ubicacion.value.lat);
                //               this.longitud.setValue(this.ubicacion.value.lng);
                this.imagenRestaurante = hotelActual.imagen;
                this.setNroWhatsapp(hotelActual.whatsapp);
                this.directorio = this.carpeta.value;
                this.configService.getLocadidadesDepartamento(hotelActual.departamento);
                this.mapaService.dMiniMapa = { centro: hotelActual.ubicacion, zoom: 15, marcador: true };
                this.mapaService.emitirMiniMapa();
            } else {
                this.mapaService.resetDataMiniMapa();
            }
        });

        // Si es un hotel nuevo crear un nombre para la carpeta
        if (this.carpeta.value === null) {
            this.directorio = this.dormirService.randomString(7);
            this.carpeta.setValue(this.directorio);
        }
    }

    ngAfterViewInit(): void {
        //es para que no se vea el error de cambio
        this.cdRef.detectChanges();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        //limpia el mapa y el mini-mapa
        this.mapaService.resetDataMapa();
        this.mapaService.resetDataMiniMapa();
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
        this.router.navigate(['/donde-dormir/listado']);
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
            //            this.ubicacion.setValue({ "lng": longitud, "lat": latitud });
            //            this.mapaService.dMiniMapa = { centro: { lng: longitud, lat: latitud }, zoom: 15, marcador: true };
            //            this.mapaService.emitirMiniMapa();
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
        this.hotelForm.controls['imagen'].setValue(this.imagenRestaurante);
        if (this.hotelForm.valid) {
            this.cambiosConfirmados = true;
            //verifica si es una actualización o un hotel nuevo
            if (this.idHotel !== undefined) {//si se esta editando un hotel
                const restauran: Hotel = this.hotelForm.value;
                restauran.id = this.idHotel;
                this.dormirService.updateHotelLocal(restauran);
                this.dormirService.updateHotelFirestore(this.hotelForm.value, this.idHotel)
                    .then(res => {
                        this.openSnackBarSubmit('¡El hotel se ha actualizado correctamente!');
                    })
                    .catch(error => {
                        this.openSnackBarSubmit('¡Error, no se ha podido actualizar el hotel en Firestore!');
                        console.error('¡Error, no se ha podido actualizar el Resturante en Firestore!. Error: ' + error);
                    });
                //limpia el mapa y el mini-mapa
                this.mapaService.resetDataMapa();
                this.mapaService.resetDataMiniMapa();
                //Limpia el minimapa y el mapa
                this.mapaService.emitirMiniMapa();
                this.mapaService.resetDataMapa();
                this.regresar();
            } else { //Si el Hotel es nuevo
                let nuevoId: string;
                this.dormirService.addHotel(this.hotelForm.value).then(id => {
                    nuevoId = id
                    if (nuevoId !== '' && nuevoId !== undefined) {
                        this.openSnackBarSubmit('¡El nuevo hotel se ha guardado correctamente con el ID: ' + nuevoId);
                    }
                }).catch(error => {
                    console.log(error);
                    this.openSnackBarSubmit('¡Por algún motivo el nuevo hotel no se pudo guardar!');
                })
                //limpia el mapa y el mini-mapa
                this.mapaService.resetDataMapa();
                this.mapaService.resetDataMiniMapa();
                //Limpia el minimapa y el mapa
                this.mapaService.emitirMiniMapa();
                this.mapaService.resetDataMapa();
                //limpia el formulario y setea los valores inicales con el metodo reset
                this.hotelForm.reset({
                    imagen: this.imagenDefault,
                });
                this.regresar();
            }
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
    setNroWhatsapp(link: string) {
        if (link !== null && link !== undefined) {
            let celular = "0" + link.slice(39)
            this.nroWhatsapp.setValue(celular)
        }
    }

    /**
     * Función que agrega un nuevo formControl de tipo telefono
     */
    agregarNuevoTelefonoAlFormulario() {
        const telefonosControl = this.hotelForm.get('telefonos') as FormArray;
        telefonosControl.push(
            this.fb.group({
                numero: ['', [this.vs.validarTelefono]]
            })
        )
        this.disabledAddPhones = telefonosControl.length >= 2 ? true : false;
    }

    eliminarTelefonoDelFormulario(i: number) {
        const telefonosControl = this.hotelForm.get('telefonos') as FormArray;
        telefonosControl.removeAt(i);
        this.disabledAddPhones = telefonosControl.length >= 2 ? true : false;
    }


    /**
     * Función para quitar los espacios en blanco del campo nombre.  
     */
    clearNombre() {
        let _nombre: string = this.nombre.value;
        _nombre = _nombre.trim();
        this.nombre.setValue(_nombre);
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
     * Función para quitar los espacios en blanco del campo instagram.  
     */
    clearInstagram() {
        let _link: string = this.instagram.value;
        _link = _link.trim();
        this.instagram.setValue(_link);
        console.log(_link)
    }

    /**
     * Función para quitar los espacios en blanco del campo whatsapp.  
     */
    clearWhatsapp() {
        let _link: string = this.nroWhatsapp.value;
        _link = _link.trim();
        this.nroWhatsapp.setValue(_link);
        console.log(_link)
    }

    /**
     * Función para quitar los espacios en blanco del campo teléfono.  
     */
    clearTelefono(i: number) {
        let controls = this.telefonos as FormArray;
        let control = controls.at(i);
        let telefono: Telefono = control.value;
        let numero: string = telefono.numero;
        numero = numero.trim();
        telefono.numero = numero
        control.setValue(telefono);
    }

    // Getters
    get carpeta() { return this.hotelForm.get('carpeta'); }
    get departamento() { return this.hotelForm.get('departamento'); }
    get direccion() { return this.hotelForm.get('direccion'); }
    get imagen() { return this.hotelForm.get('imagen') };
    get localidad() { return this.hotelForm.get('localidad'); }
    get nombre() { return this.hotelForm.get('nombre'); }
    get publicado() { return this.hotelForm.get('publicado'); }
    get telefonos() { return this.hotelForm.get('telefonos') as FormArray; }
    get ubicacion() { return this.hotelForm.get('ubicacion'); }
    get whatsapp() { return this.hotelForm.get('whatsapp'); }
    get instagram() { return this.hotelForm.get('instagram'); }

}
