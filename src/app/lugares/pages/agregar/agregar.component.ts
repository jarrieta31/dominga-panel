import { Component, Input, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lugar } from '../../interfaces/lugar.interface';
import { Imagen } from '../../../shared/interfaces/imagen.interface';
import { FormBuilder, Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { StorageService } from '../../../shared/services/storage.service';
import { Observable, pipe, Subject, Subscription, zip } from 'rxjs';
import { map, filter, tap, switchMap, takeUntil } from 'rxjs/operators';
import { DialogMapaComponent } from '../../../shared/components/dialog-mapa/dialog-mapa.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MapaService } from '../../../shared/services/mapa.service';
import { ConfigService } from '../../../shared/services/config.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LugaresService } from '../../services/lugares.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ValidatorService } from '../../../shared/services/validator.service';
import { DialogPublicarComponent } from '../../components/dialog-publicar/dialog-publicar.component';
import { Accesibilidad } from '../../../shared/interfaces/accesibilidad.interface';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Telefono } from '../../../shared/interfaces/telefono.interface';
import { Title } from '@angular/platform-browser';


@Component({
    selector: 'app-agregar',
    templateUrl: './agregar.component.html',
    styleUrls: ['./agregar.component.css']
})
export class AgregarComponent implements OnInit, OnDestroy {

    sizeLugar: number;
    sizeHome: number;
    nombreMaxLength: number;
    nombreMinLength: number;
    descripcionMaxLength: number;
    descripcionMinLength: number;
    heightLugar: number;
    heightHome: number;
    widthLugar: number;
    widthHome: number;
    accesibilidadDefault: Accesibilidad = { "banio": false, "rampa": false };
    cambiosConfirmados: boolean = false;
    departamentos: string[] = [];
    directorio: string = ''; //subcarpeta con el nombre del lugar
    directorioPadre: string = 'lugares'; //carpeta raíz donde se almacenan los lugares
    idLugar: string;
    idNuevoLugar: string = "";
    localidades: string[] = [];
    tiposLugares: string[] = [];
    mapaTouched: boolean = false;
    opsPatrimonial = [{ texto: "Sí", valor: true }, { texto: "No", valor: false }];
    prioridadAnterior: number;
    publicadoChecked: boolean = false;
    pubDisabled: boolean = false;
    titulo: string = "Nuevo Lugar";
    tituloUploaderGaleria: string = "Subir imágenes a la galería";
    tituloUploaderHome: string = "Selecciona la imágen del Home";
    public prioridades$: Observable<number[]>;
    private destroy$ = new Subject<void>();
    prioridades: number[] = [];
    private imagenHomeDefault = { "name": "imagen-default", "url": "assets/default-home.jpg" };
    private imagenPrincipalDefault = { "name": "imagen-default", "url": "assets/default-lugar-galeria.jpg" };
    home: Imagen = this.imagenHomeDefault;
    galeria: Imagen[] = [];
    galeriaAgregar: Imagen[] = []; //solo guarda las imagenes que se agregan a la galeria
    imagenesBorradas: string[] = []; // solo guarda las imagenes que se eliminaron y no se guardo el formulario

    nroWhatsapp: FormControl = this.fb.control(null, [this.vs.valididarNumeroWhatsapp]);
    ubicacionManual: FormControl = this.fb.control(null, [this.vs.validarCoordenadas]);
    banios: FormControl = this.fb.control(false, []);
    rampas: FormControl = this.fb.control(false, []);

    baniosChecked: boolean = false;
    rampasChecked: boolean = false;

    public lugarForm: FormGroup;
    editorConfig: AngularEditorConfig = {
        editable: true,
        spellcheck: true,
        height: '16rem',
        minHeight: '5rem',
        placeholder: 'Ingresa la descripción del lugar...',
        translate: 'no',
        defaultParagraphSeparator: 'p',
        width: '100%',
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
        private router: Router,
        private vs: ValidatorService,
        private activatedRoute: ActivatedRoute,
        public lugaresService: LugaresService,
        public fb: FormBuilder,
        private fbStorage: StorageService,
        public dialog: MatDialog,
        private mapaService: MapaService,
        private configService: ConfigService,
        private _snackBar: MatSnackBar,
        private title: Title,
    ) {
        this.title.setTitle("Agregar lugar")
        this.sizeLugar = this.configService.sizeLugar;
        this.heightLugar = this.configService.heightLugar;
        this.widthLugar = this.configService.widthLugar;
        this.sizeHome = this.configService.sizeHome;
        this.heightHome = this.configService.heightHome;
        this.widthHome = this.configService.widthHome;
        this.nombreMaxLength = this.configService.nombreMaxLength;
        this.nombreMinLength = this.configService.nombreMinLength;
        this.descripcionMaxLength = this.configService.lugarDescripcionMaxLength;
        this.descripcionMinLength = this.configService.lugarDescripcionMinLength;

        this.lugarForm = this.fb.group({
            accesibilidad: [this.accesibilidadDefault],
            auto: [false],
            bicicleta: [false],
            caminar: [false],
            carpeta: [null],
            departamento: ['', Validators.required],
            descripcion: ['', [Validators.minLength(this.descripcionMinLength), Validators.maxLength(this.descripcionMaxLength)]],
            facebook: [null, [this.vs.validarFacebook]],
            imagenHome: [this.imagenHomeDefault],
            imagenPrincipal: [this.imagenPrincipalDefault],
            imagenes: [[]],
            instagram: [null, [this.vs.validarInstagram]],
            localidad: ['', Validators.required],
            nombre: ['', [Validators.required, Validators.minLength(this.nombreMinLength), Validators.maxLength(this.nombreMaxLength)]],
            patrimonial: [false],
            prioridad: [1, [Validators.required]],
            publicado: [false, Validators.required],
            tipo: [''],
            telefonos: this.fb.array([
                this.fb.group({
                    numero: [null, [this.vs.validarTelefono]]
                })
            ]),
            ubicacion: [null, [this.vs.validarUbicacion, Validators.required]],
            web: [null, [this.vs.validarWeb]],
            whatsapp: [null, [this.vs.valididarWhatsapp]],
            videos: this.fb.array([
                this.fb.group({
                    url: [null, [this.vs.validarVideoYoutube]]
                })
            ])
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
        const lugarGuardado = localStorage.getItem('lugar');
        // cargando los datos de lugares, departamentos y localidades
        this.configService.getObsDepartamentos().pipe(takeUntil(this.destroy$)).subscribe(dptos => this.departamentos = dptos);
        this.configService.emitirDepartamentosActivos();
        this.configService.getObsLocalidades().pipe(takeUntil(this.destroy$)).subscribe(locs => this.localidades = locs);
        this.configService.getObsTiposLugares().pipe(takeUntil(this.destroy$)).subscribe(tiposLugares => this.tiposLugares = tiposLugares);
        this.configService.emitirTiposLugares();
        //this.prioridades$ = this.lugaresService.getObsPrioridades$();
        this.lugaresService.getObsPrioridades$().pipe(takeUntil(this.destroy$)).subscribe(prioridades => this.prioridades = prioridades);
        this.lugaresService.updateListaPrioridadesLocal(true);

        /**
        * A partir de la ruta y el id recibido obtiene el lugar para mostrar 
        */
        this.activatedRoute.params.pipe(
            switchMap(({ id }) => this.lugaresService.getLugarId(id)),
            takeUntil(this.destroy$),
        ).subscribe(lugar => {
            let lugarActual: Lugar = JSON.parse(JSON.stringify(lugar));
            if (lugarActual.id !== undefined) {//Si estamos editando un lugar
                this.title.setTitle("Editar lugar")
                this.idLugar = lugarActual.id;
                let prio = lugarActual.prioridad;
                this.prioridadAnterior = prio
                delete lugarActual.id //para setear el formulario es necesario quitar el tatributo id
                for (let i = 0; i < lugarActual.telefonos.length; i++) {
                    if (i > 0) {
                        this.agregarNuevoTelefonoAlFormulario()
                    }
                }
                this.lugarForm.reset(lugarActual);
                this.setNroWhatsapp(lugarActual.whatsapp);
                this.titulo = `Editando ${this.lugarForm.controls['nombre'].value}`;
                this.home = lugarActual.imagenHome;
                this.galeria = JSON.parse(JSON.stringify(lugarActual.imagenes));
                this.baniosChecked = lugarActual.accesibilidad.banio;
                this.rampasChecked = lugarActual.accesibilidad.rampa;
                this.directorio = this.carpeta.value;
                this.configService.getLocadidadesDepartamento(lugarActual.departamento);
                this.mapaService.dMiniMapa = { centro: lugarActual.ubicacion, zoom: 15, marcador: true };
                this.mapaService.emitirMiniMapa();
                this.lugaresService.updateListaPrioridadesLocal(false);
            }
        });

        // Si es un lugar nuevo crear un nombre para la carpeta
        if (this.carpeta.value === null) {
            this.directorio = this.lugaresService.randomString(7);
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

        this.lugarForm.reset({
            imagenHome: this.imagenHomeDefault,
            imagenPrincipal: this.imagenPrincipalDefault
        });
        this.galeria.length = 0; //vacia la galeria de fotos
        //limpia el mapa y el mini-mapa
        this.mapaService.resetDataMapa();
        this.mapaService.resetDataMiniMapa();
    }


    /**
     * Esta función transforma el link de youtube ingresado en un link para embeber en un sitio web o app.
     * Al salir del campo lo parsea a la forma correcta ejem.: https://www.youtube.com/embed/WEn3eSV-hvw 
     * Por ultimo sustitye el valor en el control del formulario.
     * @param i Es el indice que ocupa el FormControl que quiero modificar en el FormArray de videos.
     */
    parseLinkYoutube(i: number) {
        let controls = this.videos as FormArray;
        let control = controls.at(i);
        let link: string = control.value.url;
        link = link.trim()
        link = link.replace(/\s/g, "");
        link = link.replace('watch?v=', 'embed/');
        let fin = link.indexOf('&');
        if (fin !== -1) {
            link = link.slice(0, fin);// si hay una lista al final la quita
        }
        control.setValue({ url: link })
    }

    /**
     * Recibe la imágen que se agregó a la galería y se subió a Firebase Storage desde el componente upload-files.  
     * Al recibirla la agrega al array galeria y al array galeriaAgregar para saber cuales se agregaron.
     * @param $event Es la imágen que se sube a la galería
     */
    agregarImagenSubidaAGaleria($event) {
        //si el nombre de la imagen ya esta en el array la elimina
        this.galeria = this.galeria.filter((item) => {
            return item.name !== $event.name
        });
        this.galeriaAgregar = this.galeriaAgregar.filter((item) => {
            return item.name !== $event.name
        });
        //agrega la nueva imagen al array
        this.galeria.push($event);
        //agrea la nueva imagen al galeriaAgragar
        this.galeriaAgregar.push($event);
        this.lugarForm.controls['imagenes'].setValue(this.galeria);
    }

    /**
     * Captura el estado del checkbox de Baño accesibilidad y guarda su estado.
     * @param onBanios 
     */
    setAccesibilidadBanios(onBanios: MatCheckboxChange) {
        this.accesibilidadDefault.banio = onBanios.checked;
        this.accesibilidad.setValue(this.accesibilidadDefault);
    }

    /**
     * Captura el estado del checkbox de Rampa accesibilidad y guarda su estado.
     * @param onRampas 
     */
    setAccesibilidadRampas(onRampas: MatCheckboxChange) {
        this.accesibilidadDefault.rampa = onRampas.checked;
        this.accesibilidad.setValue(this.accesibilidadDefault);
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
     * Método para eliminar una imágen de la galería de lugares local y 
     * del storage de firebase.
     * @param {string} $event - Contiene el nombre de la imagen a borrar
     * 
     */
    eliminarImagenGaleria($event: string) {
        this.imagenesBorradas.push($event)
        this.galeria = this.galeria.filter((item) => {
            return item.name !== $event;
        })
        let principal: Imagen = this.imagenPrincipal.value;
        if (principal.name === $event) {
            this.lugarForm.controls['imagenPrincipal'].setValue(this.imagenPrincipalDefault);
        }
    }

    /**
     * Función que busca en Cloud Storage si quedaron imágenes que no están en el array de Sliders. 
     * Si encuentra imágnes residuales las borra.
     */
    limpiarImagenesResiduales() {
        this.imagenes.value.forEach(element => {
            console.log(element.name)
        });
        this.fbStorage.listarArchvios(`${this.directorioPadre}/${this.directorio}`)
            .then(res => {
                res.items.forEach(item => {
                    console.log("se encontro : " + item.name)
                })
            })
            .catch(error => console.log(`Error al intentar borrar la imagen residual. ${error}`))
    }

    /**
     * Función que agrega un nuevo formControl de tipo telefono
     */
    agregarNuevoTelefonoAlFormulario() {
        const telefonosControl = this.lugarForm.get('telefonos') as FormArray;
        telefonosControl.push(
            this.fb.group({
                numero: [null, [this.vs.validarTelefono]]
            })
        )
    }

    eliminarTelefonoDelFormulario(i: number) {
        const telefonosControl = this.lugarForm.get('telefonos') as FormArray;
        telefonosControl.removeAt(i);
    }

    /**
     * Función que agrega un nuevo formControl de tipo video
     */
    agregarNuevoVideoAlFormulario() {
        const videosControl = this.lugarForm.get('videos') as FormArray;
        videosControl.push(
            this.fb.group({
                url: ['', [this.vs.validarVideoYoutube]]
            })
        )
    }

    eliminarVideoDelFormulario(i: number) {
        const videosControl = this.lugarForm.get('videos') as FormArray;
        videosControl.removeAt(i);
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
            this.ubicacion.setValue({ "lng": longitud, "lat": latitud });
            this.mapaService.dMiniMapa = { centro: { lng: longitud, lat: latitud }, zoom: 15, marcador: true };
            this.mapaService.emitirMiniMapa();
        }
    }

    /**
     * Función para prevenir la publicación de un lugar sin los datos indispensables
     * para la app
     */
    switchPublicar() {
        let test: boolean = true;
        let _galeria: string = "OK";
        let _home: string = "OK";
        let _principal: string = "OK";
        let _ubicacion: string = "OK";
        let _descripcion: string = "OK";
        if (this.home.url === 'assets/default-home.jpg') {
            this.publicado.setValue(false);
            _home = `No válida`;
            test = false;
        }
        if (this.imagenPrincipal.value.url === "assets/default-lugar-galeria.jpg") {
            test = false;
            this.publicado.setValue(false);
            _principal = "No válida"
        }
        if (this.imagenes.value.length < 2) {
            test = false;
            this.publicado.setValue(false);
            _galeria = "No válida"
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
                    home: _home,
                    principal: _principal,
                    galeria: _galeria,
                    ubicacion: _ubicacion,
                    descripcion: _descripcion
                },
            });
        }
    }

    /**
     * Al cambiar la imagen home asigna el valor recibido al campo imagenHome del formulario.
     * @param $event - Contiene los datos de la imágen subida para lugaresHome.
     * Los datos son la url y el nombre del archivo. 
     */
    setImagenHome($event) {
        if ($event != "") {
            this.home = $event;
            //this.lugarForm.controls['imagenHome'].setValue($event);
        } else {
            // Si $event viene vacío se borra la imagen del storage y se asigna la imagen por defecto
            //          this.fbStorage.borrarArchivoStorage(`${this.directorioPadre}/${this.directorio}`, this.imagenHome.value.name);
            //this.lugarForm.controls['imagenHome'].setValue(this.imagenHomeDefault);
            this.home = this.imagenHomeDefault;
        }
    }

    /** Se dispara al seleccionar la imagen Principal desde la galeria, pero por ahora no hace nada */
    setImagenPrincipal() {
    }

    /**
     * Función para obtener el celular a partir del link de whatsapp y mostrar
     * en el formulario solo el número de tetéfono.
     */
    setNroWhatsapp(link: string) {
        if (link !== null) {
            //let enlace: string = this.whatsapp.value
            let celular = "0" + link.slice(39)
            this.nroWhatsapp.setValue(celular)
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
     * Este método es llamado cada vez que se selecciona un departamento
     */
    getLocalidadesPorDepartamento() {
        this.configService.getLocadidadesDepartamento(this.departamento.value)
    }

    /**
     * Abre el dialog para el mapa
     */
    abrirMapa() {
        this.mapaTouched = true;
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = true;
        dialogConfig.minHeight = "565px";
        dialogConfig.minWidth = "1400px";
        dialogConfig.id = "dialogMapa";
        dialogConfig.data = 0;
        this.dialog.open(DialogMapaComponent, dialogConfig);
    }

    /** Enviar en formulario a firebase */
    async submitLugar() {
        if (this.publicado.value === true) {
            this.switchPublicar();
        }
        //envia el formulario
        this.lugarForm.controls['imagenHome'].setValue(this.home);
        this.lugarForm.controls['imagenes'].setValue(this.galeria);
        this.limpiarImagenesResiduales()
        if (this.lugarForm.valid) {
            this.cambiosConfirmados = true;
            //verifica si es una actualización o un lugar nuevo
            if (this.idLugar !== undefined) {//si se esta editando un lugar
                //this.lugaresService.updateLugar(this.lugarForm.value, this.idLugar);
                const lugar: Lugar = this.lugarForm.value;
                lugar.id = this.idLugar;

                if (this.prioridadAnterior !== lugar.prioridad) {//Sí la prioridad cambio
                    try {
                        const updateFirestore = await this.lugaresService.updateLugarFirestore(this.lugarForm.value, this.idLugar);
                        this.lugaresService.modificarPrioridadDeLugar(lugar);
                        this.openSnackBarSubmit('¡El lugar se ha actualizado correctamente!');
                        this.lugaresService.corregirPrioridadesFirestore(lugar.id, 'edit');
                        this.regresar();
                    }
                    catch (error) {
                        this.openSnackBarSubmit('¡Error, no se ha podido actualizar el lugar en Firestore!');
                        console.error('¡Error, no se ha podido actualizar el lugar en Firestore!. Error: ' + error);
                    };
                } else { //Sí la prioridad no cambio
                    this.lugaresService.updateLugarLocal(lugar);
                    try {
                        const updateFirestore = await this.lugaresService.updateLugarFirestore(this.lugarForm.value, this.idLugar);
                        this.openSnackBarSubmit('¡El lugar se ha actualizado correctamente!');
                        this.regresar();
                    }
                    catch (error) {
                        this.openSnackBarSubmit('¡Error, no se ha podido actualizar el lugar en Firestore!');
                        console.error('¡Error, no se ha podido actualizar el lugar en Firestore!. Error: ' + error);
                    };
                }
            } else { //Si el lugar es nuevo
                try {
                    let nuevoId: string = await this.lugaresService.addLugar(this.lugarForm.value)
                    if (nuevoId !== '' && nuevoId !== undefined) {
                        this.openSnackBarSubmit('¡El nuevo lugar se ha guardado correctamente con el ID: ' + nuevoId);
                        this.lugaresService.corregirPrioridadesFirestore(nuevoId, 'add');
                    }
                }
                catch (error) {
                    console.log(error);
                    this.openSnackBarSubmit('¡Por algún motivo el nuevo lugar no se pudo gardar!');
                }
                //limpia el formulario y setea los valores inicales con el metodo reset
                this.lugarForm.reset({
                    imagenHome: this.imagenHomeDefault,
                    imagenPrincipal: this.imagenPrincipalDefault
                });
                this.galeria.length = 0; //vacia la galeria de fotos
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

    regresar() {
        this.router.navigate(['/lugares/listado']);
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
     * Función para quitar los espacios en blanco del campo web.  
     */
    clearWeb() {
        let _link: string = this.web.value;
        _link = _link.trim();
        this.web.setValue(_link);
        console.log(_link)
    }

    /**
     * Función para quitar los espacios en blanco del campo facebook.  
     */
    clearFacebook() {
        let _link: string = this.facebook.value;
        _link = _link.trim();
        this.facebook.setValue(_link);
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
     * Función para quitar los espacios en blanco del campo instagram.  
     */
    clearInstagram() {
        let _link: string = this.instagram.value;
        _link = _link.trim();
        this.instagram.setValue(_link);
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

    /** Getter que retorna el FormArray de imagenes */
    get imagenes() { return this.lugarForm.get('imagenes') as FormArray; }
    get telefonos() { return this.lugarForm.get('telefonos') as FormArray; }
    get videos() { return this.lugarForm.get('videos') as FormArray; }
    get nombre() { return this.lugarForm.get('nombre'); }
    get imagenHome() { return this.lugarForm.get('imagenHome'); }
    get ubicacion() { return this.lugarForm.get('ubicacion'); }
    get departamento() { return this.lugarForm.get('departamento'); }
    get web() { return this.lugarForm.get('web'); }
    get whatsapp() { return this.lugarForm.get('whatsapp'); }
    get instagram() { return this.lugarForm.get('instagram'); }
    get facebook() { return this.lugarForm.get('facebook'); }
    get accesibilidad() { return this.lugarForm.get('accesibilidad'); }
    get imagenPrincipal() { return this.lugarForm.get('imagenPrincipal'); }
    get prioridad() { return this.lugarForm.get('prioridad'); }
    get descripcion() { return this.lugarForm.get('descripcion'); }
    get carpeta() { return this.lugarForm.get('carpeta'); }
    get publicado() { return this.lugarForm.get('publicado'); }


}
