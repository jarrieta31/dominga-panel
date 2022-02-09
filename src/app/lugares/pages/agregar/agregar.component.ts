import { Component, Input, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lugar } from '../../interfaces/lugar.interface';
import { Imagen } from '../../../shared/interfaces/imagen.interface';
import { FormBuilder, Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { StorageService } from '../../../shared/services/storage.service';
import { Observable, pipe, Subscription, zip } from 'rxjs';
import { map, filter, tap, switchMap } from 'rxjs/operators';
import { DialogMapaComponent } from '../../../shared/components/dialog-mapa/dialog-mapa.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MapaService } from '../../../shared/services/mapa.service';
import { ConfigService } from '../../../shared/services/config.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LugaresService } from '../../services/lugares.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ValidatorService } from '../../../shared/services/validator.service';
import { DialogPublicarComponent } from '../../components/dialog-publicar/dialog-publicar.component';



@Component({
    selector: 'app-agregar',
    templateUrl: './agregar.component.html',
    styleUrls: ['./agregar.component.css']
})
export class AgregarComponent implements OnInit, OnDestroy {

    allowedSizeGallery: number = 150; //kilo bytes
    allowedSizeHome: number = 80; //kilo bytes
    cambiosConfirmados: boolean = false;
    departamentos: string[] = [];
    directorio: string = ''; //subcarpeta con el nombre del lugar
    directorioPadre: string = 'lugares'; //carpeta raíz donde se almacenan los lugares
    heightAllowedGallery: number = 450;
    heightAllowedHome: number = 353;
    idLugar: string;
    idNuevoLugar: string = "";
    localidades: string[] = [];
    lugaresTipo = [{ tipo: "Urbano" }, { tipo: "Rural" }];
    mapaTouched: boolean = false;
    opsPatrimonial = [{ texto: "Sí", valor: true }, { texto: "No", valor: false }];
    prioridadAnterior: number;
    publicadoChecked: boolean = false;
    pubDisabled: boolean = false;
    titulo: string = "Nuevo Lugar";
    tituloUploaderGaleria: string = "Subir imágenes a la galería";
    tituloUploaderHome: string = "Selecciona la imágen del Home";
    widthAllowedGallery: number = 600;
    widthAllowedHome: number = 600;
    private sourceDepartamentos: Subscription;
    private sourceLocalidades: Subscription;
    private sourceMiniMapa: Subscription;
    private sourcePrioridades: Subscription;
    public prioridades$: Observable<number[]>;
    prioridades: number[] = [];
    private imagenHomeDefault = { "name": "imagen-default", "url": "assets/default-home.jpg" };
    private imagenPrincipalDefault = { "name": "imagen-default", "url": "assets/default-lugar-galeria.jpg" };
    home: Imagen = this.imagenHomeDefault;
    galeria: Imagen[] = [];
    galeriaAgregar: Imagen[] = []; //solo guarda las imagenes que se agregan a la galeria
    imagenesBorradas: string[] = []; // solo guarda las imagenes que se eliminaron y no se guardo el formulario
    public lugarForm: FormGroup = this.fb.group({
        accesibilidad: [false],
        auto: [false],
        bicicleta: [false],
        caminar: [false],
        carpeta: [null],
        departamento: ['', Validators.required],
        descripcion: ['', [Validators.minLength(60), Validators.maxLength(4900)]],
        facebook: [null, [this.vs.validarFacebook]],
        imagenHome: [this.imagenHomeDefault],
        imagenPrincipal: [this.imagenPrincipalDefault],
        imagenes: [[]],
        instagram: [null, [this.vs.validarInstagram]],
        localidad: ['', Validators.required],
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        patrimonial: [false],
        prioridad: [1, [Validators.required]],
        publicado: [false, Validators.required],
        tipo: [''],
        telefonos: this.fb.array([
            this.fb.group({
                numero: ['', [this.vs.validarTelefono]]
            })
        ]),
        ubicacion: [null, [this.vs.validarUbicacion, Validators.required]],
        web: [null, [this.vs.validarWeb]],
        whatsapp: [null, [this.vs.valididarWhatsapp]],
        videos: this.fb.array([
            this.fb.group({
                url: ['', [this.vs.validarVideoYoutube]]
            })
        ])
    });

    editorConfig: AngularEditorConfig = {
        editable: true,
        spellcheck: true,
        height: '16rem',
        minHeight: '5rem',
        placeholder: 'Ingresa la descripción del lugar...',
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
        private router: Router,
        private vs: ValidatorService,
        private activatedRoute: ActivatedRoute,
        public lugaresService: LugaresService,
        public fb: FormBuilder,
        private fbStorage: StorageService,
        public dialog: MatDialog,
        private mapaService: MapaService,
        private configService: ConfigService,
        private _snackBar: MatSnackBar) {

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
        const lugarGuardado = localStorage.getItem('lugar');
        //this.lugaresService.cargarLugares()
        //si lugarGuardado no esta vacio lo asigna al formulario
        if (lugarGuardado) {
            //descomentar cuando este enviando bien los datos
            //    this.lugarForm.setValue(JSON.parse(lugarGuardado));
        }

        // cargando los datos de lugares, departamentos y localidades
        this.sourceDepartamentos = this.configService.getObsDepartamentos().subscribe(dptos => this.departamentos = dptos);
        this.configService.emitirDepartamentosActivos();
        this.sourceLocalidades = this.configService.getObsLocalidades().subscribe(locs => this.localidades = locs);
        //this.prioridades$ = this.lugaresService.getObsPrioridades$();
        this.sourcePrioridades = this.lugaresService.getObsPrioridades$().subscribe(prioridades => this.prioridades = prioridades);
        this.lugaresService.updateListaPrioridadesLocal(true);

        /**
        * A partir de la ruta y el id recibido obtiene el lugar para mostrar 
        */
        this.activatedRoute.params.pipe(
            switchMap(({ id }) => this.lugaresService.getLugarId(id)),
            //    tap(res => console.log(res))
        ).subscribe(lugar => {
            let lugarActual: Lugar = JSON.parse(JSON.stringify(lugar));
            if (lugarActual.id !== undefined) {//Si estamos editando un lugar
                this.idLugar = lugarActual.id;
                let prio = lugarActual.prioridad;
                this.prioridadAnterior = prio
                delete lugarActual.id //para setear el formulario es necesario quitar el tatributo id
                this.lugarForm.reset(lugarActual);
                this.titulo = `Editando ${this.lugarForm.controls['nombre'].value}`;
                this.home = lugarActual.imagenHome;
                this.galeria = JSON.parse(JSON.stringify(lugarActual.imagenes));
                this.directorio = this.carpeta.value;
                this.configService.getLocadidadesDepartamento(lugarActual.departamento);
                this.mapaService.dMiniMapa = { centro: lugarActual.ubicacion, zoom: 15, marcador: true };
                this.mapaService.emitirMiniMapa();
                this.lugaresService.updateListaPrioridadesLocal(false);
            } else {
            }
        });

        // Si es un lugar nuevo crear un nombre para la carpeta
        if (this.carpeta.value === null) {
            this.directorio = this.lugaresService.randomString(7);
            this.carpeta.setValue(this.directorio);
        }


        /**Si el formuario es válido lo guarda en el storage local */
        zip(this.lugarForm.statusChanges, this.lugarForm.valueChanges).pipe(
            filter(([stado, valor]) => stado == 'VALID'), //pasa solo los validos
            map(([stado, valor]) => valor),//descarta el estado y solo toma el valor
            //tap(data => console.log(data))//solo es para ver
        ).subscribe(formValue => {
            // localStorage.setItem('lugar', JSON.stringify(formValue));
        })
    }

    ngAfterViewInit(): void {
        //es para que no se vea el error de cambio
        this.cdRef.detectChanges();
    }

    ngOnDestroy(): void {
        //Si las imagenes agregadas no se guardaron debe ser eliminadas de Firebase Storage. 
        if (this.cambiosConfirmados === false) {
            this.galeriaAgregar.forEach(img => {
                this.fbStorage.borrarArchivoStorage(`${this.directorioPadre}/${this.directorio}`, img.name);
            });
            if (this.home.name !== "imagen-default" && this.home.url !== this.imagenHome.value.url) {
                this.fbStorage.borrarArchivoStorage(`${this.directorioPadre}/${this.directorio}`, this.home.name);
            }
        }
        this.sourceDepartamentos.unsubscribe();
        this.sourceLocalidades.unsubscribe();
        this.sourceMiniMapa.unsubscribe();
        this.sourcePrioridades.unsubscribe();;

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
    }


    /**
     * Función para quitar los espacios en blanco del campo nombre. Al salir del campo
     * toma el nombre y quita los espacios de los extremos. 
     */
    quitarEspacios() {
        let _nombre: string = this.nombre.value;
        _nombre = _nombre.trim();
        this.nombre.setValue(_nombre);
    }

    /**
     * Esta función transforma el link de youtube ingresado en un link para embeber en un sitio web o app.
     * Al salir del campo lo parsea a la forma correcta ejem.: https://www.youtube.com/embed/WEn3eSV-hvw 
     * Por ultimo sustitye el valor en el control del formulario.
     * @param i Es el indice que ocupa el FormControl que quiero modificar en el FormArray de videos.
     */
    parseLinkYoutube(i) {
        let controls = this.videos as FormArray;
        let control = controls.at(i);
        let link: string = control.value.url;
        link = link.replace(/\s/g, "");
        link = link.replace('watch?v=', 'embed/');
        let fin = link.indexOf('&');
        if (fin !== -1) {
            link = link.slice(0, fin);// si hay una lista al final la quita
        }
        console.log(link)
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
        console.log($event)
        this.galeria = this.galeria.filter((item) => {
            return item.name !== $event;
        })
        let principal: Imagen = this.imagenPrincipal.value;
        if (principal.name === $event) {
            this.lugarForm.controls['imagenPrincipal'].setValue(this.imagenPrincipalDefault);
        }

        /** Utilizando el servicio del FirebaseStorage local se borra la imagen */
        //       this.fbStorage.borrarArchivoStorage(`${this.directorioPadre}/${this.directorio}`, $event);
    }

    /**
     * Función que agrega un nuevo formControl de tipo telefono
     */
    agregarNuevoTelefonoAlFormulario() {
        const telefonosControl = this.lugarForm.get('telefonos') as FormArray;
        telefonosControl.push(
            this.fb.group({
                numero: ['', [this.vs.validarTelefono]]
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
        if (this.imagenes.value.length < 4) {
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
        console.log("estas en setImagenPrincipal ")
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
    async submitLugar() {
        if (this.publicado.value === true) {
            this.switchPublicar();
        }
        //envia el formulario
        this.lugarForm.controls['imagenHome'].setValue(this.home);
        this.lugarForm.controls['imagenes'].setValue(this.galeria);
        if (this.lugarForm.valid) {
            this.cambiosConfirmados = true;
            //verifica si es una actualización o un lugar nuevo
            if (this.idLugar !== undefined) {//si se esta editando un lugar
                //this.lugaresService.updateLugar(this.lugarForm.value, this.idLugar);
                const lugar: Lugar = this.lugarForm.value;
                lugar.id = this.idLugar;
                if (this.prioridadAnterior !== lugar.prioridad) {//Sí la prioridad cambio
                    this.lugaresService.updateLugarFirestore(this.lugarForm.value, this.idLugar)
                        .then(res => {
                            this.lugaresService.modificarPrioridadDeLugar(lugar);
                            this.openSnackBarSubmit('¡El lugar se ha actualizado correctamente!');
                        })
                        .catch(error => {
                            this.openSnackBarSubmit('¡Error, no se ha podido actualizar el lugar en Firestore!');
                            console.error('¡Error, no se ha podido actualizar el lugar en Firestore!. Error: ' + error);
                        });
                    this.lugaresService.corregirPrioridadesFirestore(lugar.id, 'edit');
                    this.regresar();
                } else { //Sí la prioridad no cambio
                    this.lugaresService.updateLugarLocal(lugar);
                    this.lugaresService.updateLugarFirestore(this.lugarForm.value, this.idLugar)
                        .then(res => {
                            this.openSnackBarSubmit('¡El lugar se ha actualizado correctamente!');
                        })
                        .catch(error => {
                            this.openSnackBarSubmit('¡Error, no se ha podido actualizar el lugar en Firestore!');
                            console.error('¡Error, no se ha podido actualizar el lugar en Firestore!. Error: ' + error);
                        });
                    this.regresar();
                }
            } else { //Si el lugar es nuevo
                let nuevoId: string;
                this.lugaresService.addLugar(this.lugarForm.value).then(id => {
                    nuevoId = id
                    if (nuevoId !== '' && nuevoId !== undefined) {
                        this.openSnackBarSubmit('¡El nuevo lugar se ha guardado correctamente con el ID: ' + nuevoId);
                        this.lugaresService.corregirPrioridadesFirestore(nuevoId, 'add');
                    }
                }).catch(error => {
                    console.log(error);
                    this.openSnackBarSubmit('¡Por algún motivo el nuevo lugar no se pudo gardar!');
                })
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
    get imagenPrincipal() { return this.lugarForm.get('imagenPrincipal'); }
    get prioridad() { return this.lugarForm.get('prioridad'); }
    get descripcion() { return this.lugarForm.get('descripcion'); }
    get carpeta() { return this.lugarForm.get('carpeta'); }
    get publicado() { return this.lugarForm.get('publicado'); }


}
