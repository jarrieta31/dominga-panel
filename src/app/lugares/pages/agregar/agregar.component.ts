import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import { Lugar, Imagen, LugarTipo, DepartamentoEnum } from '../../interfaces/lugar.interface';
import { FormBuilder, Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { StorageService } from '../../../shared/services/storage.service';
import { pipe, Subscription, zip } from 'rxjs';
import { map, filter, tap, switchMap } from 'rxjs/operators';
import { DialogMapaComponent } from '../../../shared/components/dialog-mapa/dialog-mapa.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MapaService } from '../../../shared/services/mapa.service';
import { LocalidadesService } from '../../../shared/services/localidades.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LugaresService } from '../../services/lugares.service';


@Component({
    selector: 'app-agregar',
    templateUrl: './agregar.component.html',
    styleUrls: ['./agregar.component.css']
})
export class AgregarComponent implements OnInit, OnDestroy {

    submitHabilitado = true;
    titulo: string;
    idLugar: string;
    tituloUploaderGaleria: string = "Subir imágenes a la galería";
    tituloUploaderHome: string = "Selecciona la imágen del Home";
    directorioLugaresStorage: string = "lugares2";
    directorioHomeStorage: string = "lugaresHome2";
    galeria: Imagen[] = [];
    imagenSubidaAgregar: Imagen;
    lugaresTipo = [{ tipo: "Urbano" }, { tipo: "Rural" }];
    opsPatrimonial = [{ texto: "Sí", valor: true }, { texto: "No", valor: false }];
    departamentos:string[] = [];
    localidades: string[] = [];
    private subsDepartamentos: Subscription;
    private subsLocalidades: Subscription;
    private imagenHomeDefault = { "name": "imagen-default", "url": "assets/default-home.jpg" };
    private imagenPrincipalDefault = { "name": "imagen-default", "url": "assets/default-lugar-galeria.jpg" };


    public lugarForm: FormGroup = this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        prioridad: [0, [Validators.required]],
        publicado: [false, Validators.required],
        departamento: ['', Validators.required],
        localidad: ['', Validators.required],
        auto: [false],
        bicicleta: [false],
        caminar: [false],
        patrimonial: [false],
        accesibilidad: [false],
        descripcion: ['', [Validators.minLength(15), Validators.maxLength(3000)]],
        imagenHome: [this.imagenHomeDefault],
        imagenPrincipal: [this.imagenPrincipalDefault],
        ubicacion: [{ "lng": -56.4372197, "lat": -32.8246801 }],
        tipo: [LugarTipo.urbano],
        imagenes: [[]],
        facebook: [''],
        instagram: [''],
        web: [''],
        whatsapp: [''],
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


    constructor(
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
        const sourceMapa = this.mapaService.miniMapaSubject$.subscribe(res => {
            //si los datos del minimapa son validos y tiene marcado en true
            if (res !== undefined && res.marcador == true) {
                this.ubicacion.setValue(res.centro);
            }
            else {
                this.ubicacion.setValue(0);
            }
            /** Aca hay que chequearlo bien porque iria el caso en que el formulrio biene con los datos
            if (this.ubicacion.value !== 0 ) {
                this.mapaService.dMiniMapa = this.ubicacion.value();
            }
            */
        });

        if (this.ubicacion.value !== { "lng": -56.43721973207522, "lat": -32.824680163553545 }) {
            //this.mapaService.dMiniMapa.centro = this.ubicacion.value();
        }
    }

    ngOnInit(): void {
        const lugarGuardado = localStorage.getItem('lugar');
        //si lugarGuardado no esta vacio lo asigna al formulario
        if (lugarGuardado) {
            //descomentar cuando este enviando bien los datos
            //    this.lugarForm.setValue(JSON.parse(lugarGuardado));
        }

        // cargando los datos de lugares, departamentos y localidades
        this.subsDepartamentos = this.localidadesService.getObsDepartamentos().subscribe(dptos => this.departamentos = dptos);
        this.localidadesService.emitirDepartamentosActivos();
        this.subsLocalidades = this.localidadesService.getObsLocalidades().subscribe(locs => this.localidades = locs); 

        //A partir de la ruta y el id recibido obtiene el lugar para mostrar
        this.activatedRoute.params
            .pipe(
                tap(res => console.log( res )),
                switchMap(({ id }) => this.lugaresService.getLugarId(id)),
            ).subscribe(lugar => {
                // lugar.payload.id ) 
                //const lugar = [0]this.lugaresService.getLugarId(id)
                //console.log(lugar)
                if (lugar.id != "undefined") {
                    //this.lugar = {id: lugar.payload.id, ...lugar.payload.data()};
                    this.idLugar = lugar.id;
                    delete lugar.id
                    this.lugarForm.reset(lugar);
                    this.titulo = `Editando ${this.lugarForm.controls['nombre'].value}`;
                    this.galeria = this.lugarForm.controls['imagenes'].value;
                    this.localidadesService.getLocadidadesDepartamento(lugar.departamento);
                }
                else {
                    this.titulo = "Nuevo Lugar";
                }

            });

        console.log(this.localidades);

        /**Si el formuario es válido lo guarda en el storage local */
        zip(this.lugarForm.statusChanges, this.lugarForm.valueChanges).pipe(
            filter(([stado, valor]) => stado == 'VALID'), //pasa solo los validos
            map(([stado, valor]) => valor),//descarta el estado y solo toma el valor
            //tap(data => console.log(data))//solo es para ver
        ).subscribe(formValue => {
            localStorage.setItem('lugar', JSON.stringify(formValue));
        })

        //if (this.ubicacion.value !== 0) {

        //}

        //this.getAllLocalidades();

    }

    ngOnDestroy(): void {
        this.subsDepartamentos.unsubscribe();
        this.subsLocalidades.unsubscribe();
        
    }

    /** Funciona pero no se usa es solo para pruebas: Método que trae 
     * todas las localidades existentes */
    //getAllLocalidades(): void {
    //    this.localidadesService.getAll().snapshotChanges().pipe(
    //        map(changes =>
    //            changes.map(c =>
    //                ({ id: c.payload.doc.id, ...c.payload.doc.data() })
    //            )
    //        )
    //    ).subscribe(data => {
    //        this.localidades = data;
    //    });
    //}

    agregarImagenSubida($event) {
        //si el nombre de la imagen ya esta en el array la elimina
        this.galeria = this.galeria.filter((item) => {
            return item.name !== $event.name
        });
        //agrega la nueva imagen al array
        this.galeria.push($event);
        this.lugarForm.controls['imagenes'].setValue(this.galeria);
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
            //.then(res => {
            //    this.localidades = [];
            //    res.docs.forEach(item => {
            //        //cada item contiene el id y la data por separados
            //        this.localidades.push({ id: item.id, ...item.data() })
            //    })
            //})
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
    agregarLugar() {

        if (this.lugarForm.valid && this.submitHabilitado) {
            const nuevoLugar: Lugar = this.lugarForm.value;
            console.log(nuevoLugar);
            //envia el formulario
            this.lugaresService.addLugar(nuevoLugar);

            //limpia el formulario y setea los valores inicales con el metodo reset
            //El metodo 
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

}
