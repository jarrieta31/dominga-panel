import { Component, Inject, OnInit } from '@angular/core';
import { DondeComerService } from '../../services/donde-comer.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StorageService } from '../../../shared/services/storage.service';

//Interfaces
import { Restoran } from '../../interfaces/Restoran.interface';

@Component({
    selector: 'app-dialog-eliminar',
    templateUrl: './dialog-eliminar.component.html',
    styleUrls: ['./dialog-eliminar.component.css']
})
export class DialogEliminarComponent implements OnInit {

    constructor(
        private comerService: DondeComerService,
        private fbStorage: StorageService,
        public dialogRef: MatDialogRef<DialogEliminarComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Restoran
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
     * Función que elimina un restoran de la base de datos 
     * @param id Es el id del restoran a eliminar
     */
    async eliminarRestauran(id: string) {
        let directorio = this.data.carpeta;
        if (this.data.imagen.url === "assets/default-lugar-galeria.jpg") {
            this.comerService.deleteRestoran(id);
        }
        //borra la imagen del evento de fire storage
        else {
            try {
                const clearImagen = await this.fbStorage.borrarArchivoStorage(`donde_comer/${directorio}`, this.data.imagen.name);
            } catch (error) {
                console.log('Se produjo un error al intentar eliminar la imágen ' + this.data.imagen.name + '. Error: ' + error);
            }
            this.comerService.deleteRestoran(id);
        }
    }

}
