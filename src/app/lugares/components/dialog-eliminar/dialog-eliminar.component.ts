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
    async eliminarLugar(id: string) {
        let directorio = this.data.carpeta;
        if (this.data.imagenHome.url === 'assets/default-home.jpg' && this.data.imagenes.length === 0) {
            this.lugaresService.deleteLugar(id);
        }
        //borra la imagen del home de fire storage
        else if (this.data.imagenHome.url !== "assets/default-home.jpg") {
            try {
                const clearHome = await this.fbStorage.borrarArchivoStorage(`lugares/${directorio}`, this.data.imagenHome.name);
            } catch (error) {
               console.log('Se produjo un error al intentar eliminar la imágen '+this.data.imagenHome.name+'. Error: '+error); 
            }
        }
        //borra todas las imágenes de la galeria de fire storage
        for await (const img of this.data.imagenes) {
            try {
                const deleteImagen = await this.fbStorage.borrarArchivoStorage(`lugares/${directorio}`, img.name);
            } catch (error) {
               console.log('Se produjo un error al intentar eliminar la imágen '+img.name+'. Error: '+error); 
            }
        }
        this.lugaresService.deleteLugar(id);
    }
}
