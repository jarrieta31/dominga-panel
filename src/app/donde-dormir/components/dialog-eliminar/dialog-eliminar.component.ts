import { Component, Inject, OnInit } from '@angular/core';
import { DondeDormirService } from '../../services/donde-dormir.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StorageService } from '../../../shared/services/storage.service';

//Interfaces
import { Hotel } from '../../interfaces/hotel.interface';

@Component({
    selector: 'app-dialog-eliminar',
    templateUrl: './dialog-eliminar.component.html',
    styleUrls: ['./dialog-eliminar.component.css']
})
export class DialogEliminarComponent implements OnInit {

    constructor(
        private dormiService: DondeDormirService,
        private fbStorage: StorageService,
        public dialogRef: MatDialogRef<DialogEliminarComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Hotel
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
    async eliminarRestauran(id: string) {
        let directorio = this.data.carpeta;
        if (this.data.imagen.url === "assets/default-lugar-galeria.jpg") {
            this.dormiService.deleteHotel(id);
        }
        //borra la imagen del evento de fire storage
        else {
            try {
                const clearImagen = await this.fbStorage.borrarArchivoStorage(`donde_dormir/${directorio}`, this.data.imagen.name);
            } catch (error) {
                console.log('Se produjo un error al intentar eliminar la imágen ' + this.data.imagen.name + '. Error: ' + error);
            }
            this.dormiService.deleteHotel(id);
        }
    }
}
