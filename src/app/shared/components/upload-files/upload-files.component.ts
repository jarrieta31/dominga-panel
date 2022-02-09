import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, AbstractControl, FormBuilder } from '@angular/forms';
import { StorageService } from '../../../shared/services/storage.service';
import { Imagen } from '../../../shared/interfaces/imagen.interface';
import { Video } from '../../../shared/interfaces/video.interface';
import * as CryptoJS from 'crypto-js';

@Component({
    selector: 'app-upload-files',
    templateUrl: './upload-files.component.html',
    styleUrls: ['./upload-files.component.css']
})
export class UploadFilesComponent implements OnInit {

    mensajeArchivo: string = 'No hay un archivo seleccionado';
    datosFormulario = new FormData();
    nombreArchivo: string = '';
    URLPublica: string = '';
    porcentaje: number = 0;
    finalizado: boolean = false;
    hash:string;

    @Input() widthAllowed: number = 0;
    @Input() heightAllowed: number = 0;
    @Input() allowedSize: number = 0;

    /** 
     * Es un EventEmitter del componente "Uploader".
     * Al subir un fichero, este emite el archivo que subió al componente padre.
     * De este módo se puede trabajar en esa información en el padre.
    */
    @Output() imagenSubidaUploader: EventEmitter<Imagen> = new EventEmitter<Imagen>();
    /** Es el titulo que se muestra en el componente uploader */
    @Input() tituloUploader: string;
    /** Es el nombre del subdirectorio ubicado en firebase storage donde se subirá el archivo.
     * Este nombre se crear a partir del titulo del formulario que se está creando.
      */
    @Input() Directorio: string;

    /** El el nombre del directorio raíz que representa la categoría del elemento a almacenar */
    @Input() DirectorioPadre: string;

    DirectorioUploader: string;
    percentDone: number;
    uploadSuccess: boolean;
    size: number;
    width: number;
    height: number;
    disabledSubmit: boolean = true;
    ancho: boolean = true;
    alto: boolean = true;
    peso: boolean = true;
    ruta: boolean = true;

    @ViewChild('coverFilesInput') imgType: ElementRef;

    archivoForm: FormGroup = this.fb.group({
        archivo: [null, []]
    })


    constructor(private fbStorage: StorageService, private fb: FormBuilder) {

    }

    ngOnInit(): void {
        this.width = 0;
        this.height = 0;
        this.size = 0;
    }

    //Evento que se gatilla cuando el input de tipo archivo cambia
    public cambioArchivo(event) {
        if (event.target.files.length > 0) {
            this.DirectorioUploader = `${this.DirectorioPadre}/${this.Directorio}`;
            this.percentDone = 100;
            this.uploadSuccess = true;
            let image: any = event.target.files[0];
            this.size = Math.round(((image.size / 1024) + Number.EPSILON) * 100) / 100;
            let fr = new FileReader();
            fr.onload = () => { // when file has loaded
                var img = new Image();
                img.onload = () => {
                    this.width = img.width;
                    this.height = img.height;
                    if (this.width !== this.widthAllowed || this.height !== this.heightAllowed || this.size > this.allowedSize || this.Directorio.length < 2) {
                        this.disabledSubmit = true;
                    } else if (this.width == this.widthAllowed && this.height == this.heightAllowed && this.size <= this.allowedSize && this.Directorio.length >= 2) {
                        this.disabledSubmit = false;
                    }
                    //valida el ancho mostrar el mensaje de error
                    if (this.width !== this.widthAllowed && this.width > 0) {
                        this.ancho = false;
                    } else {
                        this.ancho = true;
                    }
                    //valida el peso para el mensaje de error
                    if (this.size > this.allowedSize && this.size > 0) {
                        this.peso = false;
                    } else {
                        this.peso = true;
                    }
                    //valida el alto para  el mensaje de error.
                    if (this.height !== this.heightAllowed && this.height > 0) {
                        this.alto = false;
                    } else {
                        this.alto = true;
                    }
                };
                var md5 = CryptoJS.MD5(fr).toString();
                this.hash =md5;
                console.log(md5 )
                img.src = fr.result as string; // The data URL 
            };
            fr.readAsDataURL(image);
            for (let i = 0; i < event.target.files.length; i++) {
                this.nombreArchivo = event.target.files[i].name;
                this.datosFormulario.delete('archivo');
                this.datosFormulario.append('archivo', event.target.files[i], event.target.files[i].name);
            }
        }
    }

    //Sube el archivo a Cloud Storage
    public subirArchivo() {
        let archivo = this.datosFormulario.get('archivo');
        this.DirectorioUploader = `${this.DirectorioPadre}/${this.Directorio}`
        let referencia = this.fbStorage.referenciaCloudStorage(this.DirectorioUploader, this.nombreArchivo);
        let tarea = this.fbStorage.subirArchivoCloudStorage(this.DirectorioUploader, this.nombreArchivo, archivo);
        //Cambia el porcentaje
        tarea.percentageChanges().subscribe((porcentaje) => {
            this.porcentaje = Math.round(porcentaje);
            if (this.porcentaje == 100) {
                this.finalizado = true;
                referencia.getDownloadURL().subscribe((URL) => {
                    this.URLPublica = URL;
                    const img: Imagen = { name: this.nombreArchivo, url: URL }
                    //Dispara el evento de la nueva imagen subida para pasarla agregar.component.ts
                    this.imagenSubidaUploader.emit(img);
                });
            }
        });

    }

    get archivo() {
        return this.archivoForm.get('archivo');
    }

}
