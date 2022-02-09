import { Component, Inject, OnInit } from '@angular/core';
import { CarruselesService } from '../../services/carruseles.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StorageService } from '../../../shared/services/storage.service';
import { Slider } from '../../interfaces/slider.interface';

@Component({
  selector: 'app-dialog-eliminar',
  templateUrl: './dialog-eliminar.component.html',
  styleUrls: ['./dialog-eliminar.component.css']
})
export class DialogEliminarComponent implements OnInit {

    constructor(
        private sliderService: CarruselesService,
        private fbStorage: StorageService,
        public dialogRef: MatDialogRef<DialogEliminarComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Slider
    ) { }

    ngOnInit(): void {
    }

    /**
     * Cierra el dialog que advierte cuando se va a eliminar un lugar
     */
    closeDialog() {
        this.dialogRef.close();
    }

    /**
     * Función que elimina un evento de la base de datos 
     * @param id Es el id del evento a eliminar
     */
    async eliminarSlider(id: string) {
        let directorio = this.data.pantalla;
        if (this.data.imagen.url === "assets/default-lugar-galeria.jpg") {
            this.sliderService.deleteSlider(id);
        }
        //borra la imagen del evento de fire storage
        else {
            try {
                const clearImagen = await this.fbStorage.borrarArchivoStorage(`sliders/${directorio}`, this.data.imagen.name);
            } catch (error) {
                console.log('Se produjo un error al intentar eliminar la imágen ' + this.data.imagen.name + '. Error: ' + error);
            }
            this.sliderService.deleteSlider(id);
        }
    }

}
