import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Lugar } from '../../interfaces/lugar.interface';
import { LugaresService } from '../../services/lugares.service';
import { StorageService } from '../../../shared/services/storage.service';

@Component({
    selector: 'app-dialog-eliminar',
    templateUrl: './dialog-eliminar.component.html',
    styleUrls: ['./dialog-eliminar.component.css']
})
export class DialogEliminarComponent implements OnInit {

    constructor(
        private lugaresService: LugaresService,
        private fbStorage: StorageService,
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
    eliminarLugar(id: string) {
        try {
            let directorio = this.fbStorage.quitarAcentos(this.data.nombre);
            //borra la imagen del home de fire storage
            if (this.data.imagenHome.name !== "imagen-default") {
                this.fbStorage.borrarArchivoStorage(`lugares/${directorio}`, this.data.imagenHome.name);
            }
            //borra todas las imágenes de la galeria de fire storage
            this.data.imagenes.forEach(img => {
                this.fbStorage.borrarArchivoStorage(`lugares/${directorio}`, img.name);
            })
            this.lugaresService.deleteLugar(id);
        } catch (error) {
           console.error("Se produjó un error en dialog-eliminar Lugar")
        }
    }
}
