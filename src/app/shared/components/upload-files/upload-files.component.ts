import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '../../../shared/services/storage.service';
import { Imagen, Video } from 'src/app/lugares/interfaces/lugar.interface';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.css']
})
export class UploadFilesComponent implements OnInit {

  public archivoForm = new FormGroup({
    archivo: new FormControl(null, Validators.required),
  });

  public mensajeArchivo = 'No hay un archivo seleccionado';
  public datosFormulario = new FormData();
  public nombreArchivo = '';
  public URLPublica = '';
  public porcentaje = 0;
  public finalizado = false;

  /** 
   * Es un EventEmitter del componente "Uploader".
   * Al subir un fichero, este emite el archivo que subió al componente padre.
   * De este módo se puede trabajar en esa información en el padre.
  */
  @Output() imagenSubidaUploader: EventEmitter<Imagen> = new EventEmitter<Imagen>();

  /** Es el titulo que se muestra en el componente uploader */
  @Input() tituloUploader: string;

  /** Es el nombre del directorio ubicado en firebase storage donde se subirá el archivo  */
  @Input() DirectorioUploader: string;


  constructor(
    private fbStorage: StorageService
  ) { }

  ngOnInit(): void {
  }

  //Evento que se gatilla cuando el input de tipo archivo cambia
  public cambioArchivo(event) {
    if (event.target.files.length > 0) {
      for (let i = 0; i < event.target.files.length; i++) {
        //this.mensajeArchivo = `Archivo preparado: ${event.target.files[i].name}`;
        this.nombreArchivo = event.target.files[i].name;
        this.datosFormulario.delete('archivo');
        this.datosFormulario.append('archivo', event.target.files[i], event.target.files[i].name)
      }
    } else {
      //this.mensajeArchivo = 'No hay un archivo seleccionado';
      console.log("Mensaje desde el else");
    }
  }

  //Sube el archivo a Cloud Storage
  public subirArchivo() {
    let archivo = this.datosFormulario.get('archivo');
    let referencia = this.fbStorage.referenciaCloudStorage(this.DirectorioUploader, this.nombreArchivo);
    let tarea = this.fbStorage.subirArchivoCloudStorage(this.DirectorioUploader, this.nombreArchivo, archivo);
    //Cambia el porcentaje
    tarea.percentageChanges().subscribe((porcentaje) => {
      this.porcentaje = Math.round(porcentaje);
      if (this.porcentaje == 100) {
        this.finalizado = true;
        referencia.getDownloadURL().subscribe((URL) => {
          this.URLPublica = URL;
          //Dispara el evento de la nueva imagen subida para pasarla agregar.component.ts
          this.imagenSubidaUploader.emit({ name: this.nombreArchivo, url: URL });
        });
      }
    });

  }

}
