import { Component, Input, OnInit } from '@angular/core';
import { Lugar, Imagen, LugarTipo, Departamento } from '../../interfaces/lugar.interface';
import { FormBuilder, Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { StorageService } from '../../../shared/services/storage.service';
import { zip } from 'rxjs';
import { map, filter, tap } from 'rxjs/operators';


@Component({
    selector: 'app-agregar',
    templateUrl: './agregar.component.html',
    styleUrls: ['./agregar.component.css']
})
export class AgregarComponent implements OnInit {

    tituloUploaderGaleria: string = "Subir imágenes a la galería";
    tituloUploaderHome: string = "Selecciona la imágen del Home";
    directorioLugaresStorage: string = "lugares2";
    directorioHomeStorage: string = "lugaresHome2";
    galeria: Imagen[] = [];
    imagenSubidaAgregar: Imagen;
    lugaresTipo = [{ tipo: "Urbano" }, { tipo: "Rural" }];
    public departamentos = Object.values(Departamento);
    private imagenHomeDefault = { name: "imagen-default", url: "assets/default-home.jpg" };
    private imagenPrincipalDefault = { name: "imagen-default", url: "assets/default-lugar-galeria.jpg" };

    public lugarForm: FormGroup = this.fb.group({
        publicado: [false, Validators.required],
        auto: [false],
        departamento: [Departamento.sanJose, Validators.required],
        bicicleta: [false],
        caminar: [false],
        patrimonial: [false],
        accesibilidad: [false],
        descripcion: [''],
        imagenHome: [ this.imagenHomeDefault ],
        facebook: [''],
        imagenPrincipal: [ this.imagenPrincipalDefault ],
        instagram: [''],
        latitud: [0.0],
        longitud: [0.0],
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        tipo: [LugarTipo.urbano],
        imagenes: this.fb.array([
            this.fb.group({
                name: [''],
                url: ['']
            })
        ]),
        //valoraciones?: Valoracion[];
        videos: this.fb.array([
            this.fb.group({
                name: ['', Validators.required],
                url: ['', Validators.required]
            })
        ]),
        web: [''],
        whatsapp: [''],
        telefonos: this.fb.array([
            this.fb.group({
                numero: ['20307361', [Validators.minLength(8)]]
            })
        ])
    });


    constructor(
        public fb: FormBuilder,
        private fbStorage: StorageService
    ) { }

    ngOnInit(): void {
        const lugarGuardado = localStorage.getItem('lugar');
        //si lugarGuardado no esta vacio lo asigna al formulario
        if (lugarGuardado) {
            this.lugarForm.setValue(JSON.parse(lugarGuardado));
        }

        /**Si el formuario es válido lo guarda en el storage local */
        zip(this.lugarForm.statusChanges, this.lugarForm.valueChanges).pipe(
            filter(([stado, valor]) => stado == 'VALID'), //pasa solo los validos
            map(([stado, valor]) => valor),//descarta el estado y solo toma el valor
            tap(data => console.log(data))//solo es para ver
        ).subscribe(formValue => {
            localStorage.setItem('lugar', JSON.stringify(formValue));
        })
    }

    agregarImagenSubida($event) {
        //si el nombre de la imagen ya esta en el array la elimina
        this.galeria = this.galeria.filter((item) => {
            return item.name !== $event.name
        });
        //agrega la nueva imagen al array
        this.galeria.push($event);
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

    agregarNuevoTelefonoAlFormulario() {
        const telefonosControl = this.lugarForm.get('telefonos') as FormArray;
        telefonosControl.push(
            this.fb.group({
                numero: [, [Validators.required, Validators.minLength(8)]]
            })
        )
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
            this.lugarForm.controls['imagenHome'].setValue( this.imagenHomeDefault );
        }
    }

    /** Se dispara al seleccionar la imagen Principal desde la galeria, pero por ahora no hace nada */
    setImagenPrincipal() {
        console.log("estas en setImagenPrincipal ")
    }

    agregarNuevoVideoAlFormulario() {
        const videosControl = this.lugarForm.get('videos') as FormArray;
        videosControl.push(
            this.fb.group({
                name: ['', Validators.required],
                url: ['', Validators.required]
            })
        )
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

}
