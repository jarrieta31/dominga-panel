import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Lugar } from '../../interfaces/lugar.interface';
import { LugaresService } from '../../services/lugares.service';

@Component({
    selector: 'app-dialog-eliminar',
    templateUrl: './dialog-eliminar.component.html',
    styleUrls: ['./dialog-eliminar.component.css']
})
export class DialogEliminarComponent implements OnInit {

    constructor(
        private lugaresService: LugaresService,
        public dialogRef: MatDialogRef<DialogEliminarComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Lugar
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
     * Función que elimina un lugar de la base de datos 
     * @param id Es el id del lugar a eliminar
     */
    eliminarLugar(id:string){
        this.lugaresService.deleteLugar(id);
    }
}
