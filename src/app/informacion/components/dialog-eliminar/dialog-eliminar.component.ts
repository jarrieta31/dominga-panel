import { Component, Inject, OnInit } from '@angular/core';
import { InformacionService } from '../../services/informacion.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StorageService } from '../../../shared/services/storage.service';

//Interfaces
import { Informacion } from '../../interfaces/informacion.interface';

@Component({
    selector: 'app-dialog-eliminar',
    templateUrl: './dialog-eliminar.component.html',
    styleUrls: ['./dialog-eliminar.component.css']
})
export class DialogEliminarComponent implements OnInit {

    constructor(
        private infoService: InformacionService,
        private fbStorage: StorageService,
        public dialogRef: MatDialogRef<DialogEliminarComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Informacion
    ) { }


    ngOnInit(): void {
    }


    /**
     * Cierra el dialog que advierte cuando se va a eliminar un informacion
     */
    closeDialog() {
        this.dialogRef.close();
    }

    /**
     * Función que elimina la información de la base de datos 
     * @param id Es el id de la información a eliminar
     */
    async eliminarRestauran(id: string) {
        this.infoService.deleteInformacion(id);
    }


}
