import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import { Lugar, Imagen, LugarTipo, DepartamentoEnum } from '../../interfaces/lugar.interface';
import { FormBuilder, Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { StorageService } from '../../../shared/services/storage.service';
import { Observable, pipe, Subscription, zip } from 'rxjs';
import { map, filter, tap, switchMap } from 'rxjs/operators';
import { DialogMapaComponent } from '../../../shared/components/dialog-mapa/dialog-mapa.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MapaService } from '../../../shared/services/mapa.service';
import { LocalidadesService } from '../../../shared/services/localidades.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LugaresService } from '../../services/lugares.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ValidatorService } from '../../../shared/services/validator.service';



@Component({
    selector: 'app-agregar',
    templateUrl: './agregar.component.html',
    styleUrls: ['./agregar.component.css']
})
export class AgregarComponent implements OnInit, OnDestroy {

    submitHabilitado = true;
    idNuevoLugar: string = "";
    titulo: string = "Nuevo Lugar";
    idLugar: string;
    prioridadAnterior: number;
    tituloUploaderGaleria: string = "Subir imágenes a la galería";
    tituloUploaderHome: string = "Selecciona la imágen del Home";
    directorioLugaresStorage: string = "lugares2";
    directorioHomeStorage: string = "lugaresHome2";
    galeria: Imagen[] = [];
    imagenSubidaAgregar: Imagen;
    lugaresTipo = [{ tipo: "Urbano" }, { tipo: "Rural" }];
    opsPatrimonial = [{ texto: "Sí", valor: true }, { texto: "No", valor: false }];
    departamentos: string[] = [];
    localidades: string[] = [];
    private sourceDepartamentos: Subscription;
    private sourceLocalidades: Subscription;
    private sourceMiniMapa: Subscription;
    private sourcePrioridades: Subscription;
    public prioridades$: Observable<number[]>;
    prioridades: number[] = [];
    private imagenHomeDefault = { "name": "imagen-default", "url": "assets/default-home.jpg" };
    private imagenPrincipalDefault = { "name": "imagen-default", "url": "assets/default-lugar-galeria.jpg" };


    public lugarForm: FormGroup = this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        prioridad: [1, [Validators.required]],
        publicado: [false, Validators.required],
        departamento: ['', Validators.required],
        localidad: ['', Validators.required],
        auto: [false],
        bicicleta: [false],
        caminar: [false],
        patrimonial: [false],
        accesibilidad: [false],
        descripcion: ['', [Validators.minLength(60), Validators.maxLength(4800)]],
        imagenHome: [this.imagenHomeDefault],
        imagenPrincipal: [this.imagenPrincipalDefault],
        ubicacion: [{ "lng": -56.4372197, "lat": -32.8246801 }],
        tipo: [LugarTipo.urbano],
        imagenes: [[]],
        facebook: [null, [this.vs.validarFacebook]],
        instagram: [null, [this.vs.validarInstagram]],
        web: [null, [this.vs.validarWeb]],
        whatsapp: [null, [this.vs.valididarWhatsapp]],
        telefonos: this.fb.array([
            this.fb.group({
                numero: ['', [Validators.minLength(8), Validators.maxLength(9)]]
            })
        ]),
        videos: this.fb.array([
            this.fb.group({
                url: ['']
            })
        ])
    });

    editorConfig: AngularEditorConfig = {
        editable: true,
        spellcheck: true,
        height: '15rem',
        minHeight: '5rem',
        placeholder: 'Enter text here...',
        translate: 'no',
        defaultParagraphSeparator: 'p',
        defaultFontName: 'Arial',
        toolbarHiddenButtons: [
            //['bold']
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
        private vs: ValidatorService,
        private activatedRoute: ActivatedRoute,
        public lugaresService: LugaresService,
        public fb: FormBuilder,
        private fbStorage: StorageService,
        public dialog: MatDialog,
        private mapaService: MapaService,
        private localidadesService: LocalidadesService,
        private _snackBar: MatSnackBar) {


        /** Observable que se dispara al cambiar el valor del minimapa.
     *  Los datos del formulario cambian en funcion del valor del mimimapa
     */
        this.sourceMiniMapa = this.mapaService.getObsMiniMapa().subscribe(res => {
            //si los datos del minimapa son validos y tiene marcado en true
            if (res !== undefined && res.marcador == true) {
                this.ubicacion.setValue(res.centro);
            }
            else {
                this.ubicacion.setValue(0);
            }
            /** Aca hay que chequearlo bien porque iria el caso en que el formulrio biene con los datos
             */
            if (this.ubicacion.value !== 0) {
                //this.mapaService.dMiniMapa = this.ubicacion.value();
            }

        });

        if (this.ubicacion.value !== { "lng": -56.43721973207522, "lat": -32.824680163553545 }) {
            //this.mapaService.dMiniMapa.centro = this.ubicacion.value();
        }
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
        this.sourceDepartamentos = this.localidadesService.getObsDepartamentos().subscribe(dptos => this.departamentos = dptos);
        this.localidadesService.emitirDepartamentosActivos();
        this.sourceLocalidades = this.localidadesService.getObsLocalidades().subscribe(locs => this.localidades = locs);
        //this.prioridades$ = this.lugaresService.getObsPrioridades$();
        this.sourcePrioridades = this.lugaresService.getObsPrioridades$().subscribe(prioridades => this.prioridades = prioridades);

        this.lugaresService.updateListaPrioridadesLocal(true);
        /**
        * A partir de la ruta y el id recibido obtiene el lugar para mostrar 
        */
        this.activatedRoute.params.pipe(
            //tap(res => console.log("hola mundo")),
            switchMap(({ id }) => this.lugaresService.getLugarId(id)),
        ).subscribe(lugar => {
            let lugarActual: Lugar = JSON.parse(JSON.stringify(lugar));
            //console.log("Lugar  " + lugar)
            if (lugarActual.id !== undefined) {//Si estamos editando un lugar
                this.idLugar = lugarActual.id;
                let prio = lugar.prioridad;
                this.prioridadAnterior = prio
                delete lugarActual.id //para setear el formulario es necesario quitar el tatributo id
                this.lugarForm.reset(lugarActual);
                this.titulo = `Editando ${this.lugarForm.controls['nombre'].value}`;
                this.galeria = this.lugarForm.controls['imagenes'].value;
                this.localidadesService.getLocadidadesDepartamento(lugarActual.departamento);
                this.mapaService.dMiniMapa = { centro: lugarActual.ubicacion, zoom: 15, marcador: true };
                this.mapaService.emitirMiniMapa();
                this.lugaresService.updateListaPrioridadesLocal(false);
            }
        });

        /**Si el formuario es válido lo guarda en el storage local */
        zip(this.lugarForm.statusChanges, this.lugarForm.valueChanges).pipe(
            filter(([stado, valor]) => stado == 'VALID'), //pasa solo los validos
            map(([stado, valor]) => valor),//descarta el estado y solo toma el valor
            //tap(data => console.log(data))//solo es para ver
        ).subscribe(formValue => {
            localStorage.setItem('lugar', JSON.stringify(formValue));
        })
    }

    ngOnDestroy(): void {
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

    agregarImagenSubida($event) {
        //si el nombre de la imagen ya esta en el array la elimina
        this.galeria = this.galeria.filter((item) => {
            return item.name !== $event.name
        });
        //agrega la nueva imagen al array
        this.galeria.push($event);
        this.lugarForm.controls['imagenes'].setValue(this.galeria);
    }


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
        this.galeria = this.galeria.filter((item) => {
            return item.name !== $event;
        })
        /** Utilizando el servicio del FirebaseStorage local se borra la imagen */
        this.fbStorage.borrarArchivoStorage(this.directorioLugaresStorage, $event);
    }

    /**
     * Función que agrega un nuevo formControl de tipo telefono
     */
    agregarNuevoTelefonoAlFormulario() {
        const telefonosControl = this.lugarForm.get('telefonos') as FormArray;
        telefonosControl.push(
            this.fb.group({
                numero: ['', [Validators.minLength(8), Validators.maxLength(9)]]
            })
        )
    }

    /**
     * Función que agrega un nuevo formControl de tipo video
     */
    agregarNuevoVideoAlFormulario() {
        const videosControl = this.lugarForm.get('videos') as FormArray;
        videosControl.push(
            this.fb.group({
                url: ['']
            })
        )
    }

    /**Función para prevenir la publicación de un lugar sin los datos indispensables
     * para la app
     */
    openSnackBar() {
        let message = "Mensaje de error al publicar el lugar"
        this._snackBar.open(message, "Aceptar", {
            horizontalPosition: 'center',
            verticalPosition: 'top',
        });
    }

    /**
     * Asigna el valor recibido al campo imagenHome del formulario.
     * @param $event - Contiene los datos de la imágen subida para lugaresHome.
     * Los datos son la url y el nombre del archivo. 
     */
    setImagenHome($event) {
        if ($event != "") {
            this.lugarForm.controls['imagenHome'].setValue($event);
        } else {
            // Si $event viene vacío se borra la imagen del storage y se asigna la imagen por defecto
            this.fbStorage.borrarArchivoStorage(this.directorioHomeStorage, this.imagenHome.value.name);
            this.lugarForm.controls['imagenHome'].setValue(this.imagenHomeDefault);
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
        this.localidadesService.getLocadidadesDepartamento(this.departamento.value)
    }

    /**
     * Abre el dialog con para el mapa
     */
    openDialog() {

        if (this.submitHabilitado) {
            this.submitHabilitado = false;
        }
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = true;
        dialogConfig.minHeight = "450px";
        dialogConfig.minWidth = "900px";
        dialogConfig.id = "dialogMapa";
        dialogConfig.data = 0;
        const dialogRef = this.dialog.open(DialogMapaComponent, dialogConfig);

        dialogRef.afterClosed().pipe(
            tap(res => {
                this.submitHabilitado = true;
            })
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
            //this.mapaService.emitirDataMap(this.mapaService.dataTemporal);
        });

    }

    /** Enviar en formulario a firebase */
    async submitLugar() {
        //envia el formulario
        if (this.lugarForm.valid && this.submitHabilitado) {
            //verifica si es una actualización o un lugar nuevo
            if (this.idLugar !== undefined) {//si se esta editando un lugar
                //this.lugaresService.updateLugar(this.lugarForm.value, this.idLugar);
                const lugar: Lugar = this.lugarForm.value;
                lugar.id = this.idLugar;
                if (this.prioridadAnterior !== lugar.prioridad) {//Sí la prioridad cambio
                    this.lugaresService.modificarPrioridadDeLugar(lugar);
                    this.lugaresService.updateLugarFirestore(this.lugarForm.value, this.idLugar)
                        .then(res => {
                            this.openSnackBarSubmit('¡El lugar se ha actualizado correctamente!');
                        })
                        .catch(error => {
                            this.openSnackBarSubmit('¡Error, no se ha podido actualizar el lugar en Firestore!');
                            console.error('¡Error, no se ha podido actualizar el lugar en Firestore!. Error: '+ error);
                        });
                    this.lugaresService.corregirPrioridadesFirestore(lugar.id,'edit');
                } else { //Sí la prioridad no cambio
                    this.lugaresService.updateLugarLocal(lugar);
                    this.lugaresService.updateLugarFirestore(this.lugarForm.value, this.idLugar)
                        .then(res => {
                            this.openSnackBarSubmit('¡El lugar se ha actualizado correctamente!');
                        })
                        .catch(error => {
                            this.openSnackBarSubmit('¡Error, no se ha podido actualizar el lugar en Firestore!');
                            console.error('¡Error, no se ha podido actualizar el lugar en Firestore!. Error: '+ error);
                        });
                }
            } else { //Si el lugar es nuevo
                let nuevoId = this.lugaresService.addLugar(this.lugarForm.value);
                if(nuevoId !== ''){
                    this.openSnackBarSubmit('¡El nuevo lugar se ha guardado correctamente!');
                    this.lugaresService.corregirPrioridadesFirestore(nuevoId,'add');
                }else{
                    this.openSnackBarSubmit('¡Por algún motivo el nuevo lugar no se pudo gardar!');
                }
                this.openSnackBarSubmit('¡Se a guardado el nuevo lugar!');
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
            }
        }
    }


    /** Getter que retorna el FormArray de imagenes */
    get imagenes() {
        return this.lugarForm.get('imagenes') as FormArray;
    }

    /** Getter que retorna el FormArray de telefonos */
    get telefonos() {
        return this.lugarForm.get('telefonos') as FormArray;
    }

    /** Getter que retorna el FormArray de videos */
    get videos() {
        return this.lugarForm.get('videos') as FormArray;
    }

    /** Getter que retorna el FormControl del campo nombre */
    get nombre() {
        return this.lugarForm.get('nombre');
    }

    /** Getter que retorna el FormControl del campo imagenHome */
    get imagenHome() {
        return this.lugarForm.get('imagenHome');
    }

    /** Getter que retorna el FormControl del campo ubicacion */
    get ubicacion() {
        return this.lugarForm.get('ubicacion');
    }

    get departamento() {
        return this.lugarForm.get('departamento');
    }

    get web() {
        return this.lugarForm.get('web');
    }
    get whatsapp() {
        return this.lugarForm.get('whatsapp');
    }
    get instagram() {
        return this.lugarForm.get('instagram');
    }
    get facebook() {
        return this.lugarForm.get('facebook');
    }

    get prioridad() {
        return this.lugarForm.get('prioridad');
    }

    get descripcion() {
        return this.lugarForm.get('descripcion');
    }
}
