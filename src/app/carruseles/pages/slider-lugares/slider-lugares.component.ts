import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { CarruselesService } from '../../services/carruseles.service';
import { Slider } from '../../interfaces/slider.interface';
import { takeUntil } from 'rxjs/operators';
import { ValidatorService } from '../../../shared/services/validator.service';
import { Imagen } from '../../../shared/interfaces/imagen.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogPublicarComponent } from '../../components/dialog-publicar/dialog-publicar.component';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from '../../../shared/services/storage.service';

@Component({
  selector: 'app-slider-lugares',
  templateUrl: './slider-lugares.component.html',
  styleUrls: ['./slider-lugares.component.css']
})
export class SliderLugaresComponent implements OnInit {

    private destroy$ = new Subject<void>();
    allowedSizeGallery: number = 150; //kilo bytes
    cambiosConfirmados: boolean = false;
    datosInvalidos: boolean = true;
    directorio: string = 'lugares'; //subcarpeta con el nombre del lugar
    directorioPadre: string = 'sliders'; //carpeta raíz donde se almacenan los lugares
    heightAllowedEvento: number = 500;
    idSlider: string;
    imagenDefault = { "name": "imagen-default", "url": "assets/default-lugar-galeria.jpg" };
    imagenSlider: Imagen = this.imagenDefault;
    imgAgregadas: Imagen[] = [];
    linkSeleccionado: string;
    page: number = 1;
    sliders: Slider[] = [];
    titulo: string = 'Carrusel Lugares'
    widthAllowedEvento: number = 850;

    public sliderForm: FormGroup = this.fb.group({
        imagen: [this.imagenSlider],
        link: [null],
        linkTipo: [null],
        pantalla: [this.directorio],
        publicado: [false]
    })

    links: string[] = [
        'instagram',
        'facebook',
        'web',
        'whatsapp',
    ];

    web: FormControl = this.fb.control(null, [this.vs.validarWeb]);
    instagram: FormControl = this.fb.control(null, [this.vs.validarInstagram]);
    facebook: FormControl = this.fb.control(null, [this.vs.validarFacebook]);
    whatsapp: FormControl = this.fb.control(null, [this.vs.valididarNumeroWhatsapp]);
    radioButtonLinks: FormControl = this.fb.control(null, []);

    constructor(
        private fb: FormBuilder,
        private _snackBar: MatSnackBar,
        private slidersService: CarruselesService,
        public dialog: MatDialog,
        private vs: ValidatorService,
        private storageService: StorageService,
    ) { }

    ngOnInit() {
        this.slidersService.getObsSliders$()
            .pipe(takeUntil(this.destroy$))
            .subscribe(sliders => this.sliders = sliders)
        this.pantalla.setValue(this.directorio);
        this.slidersService.getSliderFirestore(this.directorio);
    }

    ngOnDestroy(): void {
        this.limpiarImagenesResiduales();
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Función que busca en Cloud Storage si quedaron imágenes que no están en el array de Sliders. 
     * Si encuentra imágnes residuales las borra.
     */
    limpiarImagenesResiduales(){
        this.storageService.listarArchvios(`${this.directorioPadre}/${this.directorio}`)
            .then(res => {
                res.items.forEach(item => {
                    const existe = (element: Slider) => element.imagen.name === item.name;
                    if (!this.sliders.some(existe)) {
                        this.storageService.borrarArchivoStorage(`${this.directorioPadre}/${this.directorio}`, item.name);
                        console.log("se elimino la imagen: "+item.name)
                    }
                })
            })
            .catch(error => console.log(`Error al intentar borrar la imagen residual. ${error}`))
    }

    setLinkWhatsapp() {
        if (this.whatsapp.valid) {
            let nro: string = this.whatsapp.value;
            nro = nro.slice(1);
            let url: string = 'https://api.whatsapp.com/send?phone=598' + nro;
            this.link.setValue(url);
            this.linkTipo.setValue(this.linkSeleccionado);
            this.activarBtnGuardar()
        } else {
            this.link.setValue(null);
            this.linkTipo.setValue(null);
            this.activarBtnGuardar()
        }
    }

    setLinkInstagram() {
        if (this.instagram.valid) {
            this.link.setValue(this.instagram.value);
            this.linkTipo.setValue(this.linkSeleccionado);
            this.activarBtnGuardar()
        }else{
            this.link.setValue(null);
            this.linkTipo.setValue(null);
            this.activarBtnGuardar()
        }
    }

    setLinkFacebook() {
        if (this.facebook.valid) {
            this.link.setValue(this.facebook.value);
            this.linkTipo.setValue(this.linkSeleccionado);
            this.activarBtnGuardar()
        }else{
            this.link.setValue(null);
            this.linkTipo.setValue(null);
            this.activarBtnGuardar()
        }
    }

    setLinkWeb() {
        if (this.web.valid) {
            this.link.setValue(this.web.value);
            this.linkTipo.setValue(this.linkSeleccionado);
            this.activarBtnGuardar()
        }else{
            this.link.setValue(null);
            this.linkTipo.setValue(null);
            this.activarBtnGuardar()
        }
    }

    borrarLink() {
        this.radioButtonLinks.setValue(null);
        this.link.setValue(null);
        this.linkSeleccionado = null;
    }

    changeTipoLink() {
        //this.linkTipo.setValue(this.linkSeleccionado);
    }

    /** 
     * Esta función toma los valores  del slider perteneciente a la tarjeta en la que se
     * presionó editar y carga el formulario con sus datos para editarlos.
     * @param slider: es el slider seleccionado desde la tarjeta
     */
    editar(slider: Slider) {
        let sliderActual: Slider = JSON.parse(JSON.stringify(slider))
        this.idSlider = sliderActual.id;
        delete sliderActual.id;
        this.sliderForm.reset(sliderActual)
        this.linkSeleccionado = sliderActual.linkTipo;
        this.imagenSlider = sliderActual.imagen;
        if (this.linkSeleccionado === 'instagram') { this.instagram.setValue(sliderActual.link) }
        if (this.linkSeleccionado === 'web') { this.web.setValue(sliderActual.link) }
        if (this.linkSeleccionado === 'facebook') { this.facebook.setValue(sliderActual.link) }
        if (this.linkSeleccionado === 'whatsapp') {
            let enlace: string = sliderActual.link
            let celular = "0" + enlace.slice(39)
            this.whatsapp.setValue(celular)
        }
        this.activarBtnGuardar()
    }

    resetFormulario() {
        this.limpiarImagenesSubidas(this.imagen.value.name)
        this.sliderForm.reset({
            imagen: this.imagenDefault,
            link: null,
            linkTipo: null,
            pantalla: this.directorio,
        });
        this.borrarLink();
        this.imagenSlider = this.imagenDefault;
        this.idSlider = null;
    }

    activarBtnGuardar() {
        if (this.imagenSlider.name !== "imagen-default" && this.sliderForm.valid && this.whatsapp.valid && this.instagram.valid && this.facebook.valid && this.web.valid) {
            this.datosInvalidos = false;
        } else {
            this.datosInvalidos = true;
        }
    }

    /**
     * Al cambiar la imagen del slider, asigna el valor recibido a  la variable imagenEvento del formulario.
     * @param $imagen - Contiene los datos de la imágen subida para el slider.
     * Los datos son la url y el nombre del archivo. 
     */
    setImagenSlider($imagen: Imagen) {
        const checkImgActual = this.imgAgregadas.filter(img => img.name === this.imagen.value.name);
        if (checkImgActual.length === 0) {
            this.imgAgregadas.push(this.imagen.value)
        }
        if ($imagen !== null && $imagen !== undefined) {
            const existe = (element: Slider) => element.imagen.name === $imagen.name;
            if (!this.sliders.some(existe)) {
                this.imagenSlider = $imagen;
                this.activarBtnGuardar()
                const result = this.imgAgregadas.filter(img => img.name == $imagen.name);
                if (result.length === 0) {
                    this.imgAgregadas.push($imagen);
                    console.log("Se agrego la img: " + $imagen.name)
                }
            } else {
                this.openSnackBarSubmit(`La imágen "${$imagen.name}" ya existe`)
            }

        } else {
            this.imagenSlider = this.imagenDefault;
        }
    }

    /**
     * Elimina las imagenes subidas que no son necesarias, excepto la que tiene el nombre recibido por parametro.
     * @param nombreImagen nombre de la imagen que se debe conservar. 
     */
    async limpiarImagenesSubidas(nombreImagen: string) {
        for (const i of this.imgAgregadas) {
            console.log(i.name)
        }
        for (const imagen of this.imgAgregadas) {
            if (imagen.name !== nombreImagen && imagen.name !== 'imagen-default') {
                const borrarImg = await this.storageService.borrarArchivoStorage(`${this.directorioPadre}/${this.directorio}`, imagen.name)
                    .then(response => {
                        console.log(`Se eliminó la imágen ${imagen.name}`)
                    })
                    .catch(error => { console.log(`Error al intentar eliminar la imágen ${imagen.name}. Error: ${error}`) })
            }
        }
        this.imgAgregadas.length = 0;
    }

    /**
     * Función para prevenir la publicación de un lugar sin los datos indispensables
     * para la app
     */
    switchPublicar() {
        let test: boolean = true;
        let _imagen: string = "OK";

        if (this.imagen.value.url === "assets/default-lugar-galeria.jpg") {
            test = false;
            this.publicado.setValue(false);
            _imagen = "Falta subir una imágen válida para publicar."
        }
        if (!test) {
            this.dialog.open(DialogPublicarComponent, {
                data: {
                    imagen: _imagen,
                },
            });
        }
    }

    /** 
     * Función para mostrar un mensaje corto al usuario 
     * @param message Es el texto que se muestra en el snackBar
     */
    openSnackBarSubmit(message: string) {
        this._snackBar.open(message, "Aceptar", {
            duration: 10000
        });
    }

    /** Enviar en formulario a firebase */
    async submitSlider() {
        //envia el formulario
        this.imagen.setValue(this.imagenSlider);
        this.limpiarImagenesSubidas(this.imagen.value.name);
        if (this.sliderForm.valid) {
            this.cambiosConfirmados = true;
            //verifica si es una actualización o un slider nuevo
            console.log("ID: " + this.idSlider)
            if (this.idSlider !== null && this.idSlider !== undefined) {//si se esta editando un slider
                const slider: Slider = this.sliderForm.value;
                slider.id = this.idSlider;
                this.slidersService.updateSliderLocal(slider);
                this.slidersService.updateSliderFirestore(this.sliderForm.value, this.idSlider)
                    .then(res => {
                        this.openSnackBarSubmit(`¡El slider con id: ${this.idSlider} se ha actualizado!`);
                        //limpia el formulario y setea los valores inicales con el metodo reset
                        this.sliderForm.reset({
                            imagen: this.imagenDefault,
                            link: null,
                            linkTipo: null,
                            pantalla: this.directorio,
                        });
                        this.imagenSlider = this.imagenDefault;
                        this.borrarLink();
                        this.idSlider = null;
                    })
                    .catch(error => {
                        this.openSnackBarSubmit('¡Error, no se ha podido actualizar el slider en Firestore!');
                        console.error('¡Error, no se ha podido actualizar el lugar en Firestore!. Error: ' + error);
                    });
            } else { //Si el lugar es nuevo
                let nuevoId: string;
                this.slidersService.addSlider(this.sliderForm.value).then(id => {
                    nuevoId = id
                    if (nuevoId !== '' && nuevoId !== undefined) {
                        this.openSnackBarSubmit('¡El nuevo slider se ha guardado correctamente con el ID: ' + nuevoId);
                        //limpia el formulario y setea los valores inicales con el metodo reset
                        this.sliderForm.reset({
                            imagen: this.imagenDefault,
                            linkTipo: null,
                            link: null,
                            pantalla: this.directorio,
                        });
                        this.imagenSlider = this.imagenDefault;
                        this.borrarLink();
                        this.idSlider = null;
                    }
                }).catch(error => {
                    console.log(error);
                    this.openSnackBarSubmit('¡Por algún motivo el nuevo slider no se pudo guardar!');
                })
            }
        }
    }

    get link() { return this.sliderForm.get('link'); }
    get linkTipo() { return this.sliderForm.get('linkTipo'); }
    get imagen() { return this.sliderForm.get('imagen'); }
    get pantalla() { return this.sliderForm.get('pantalla'); }
    get publicado() { return this.sliderForm.get('publicado'); }

}




