import { Component, Inject, OnInit } from '@angular/core';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ArtistasService } from '../../services/artistas.service';
import { Artista } from '../../interfaces/artista.interface';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-eliminar',
  templateUrl: './dialog-eliminar.component.html',
  styleUrls: ['./dialog-eliminar.component.css']
})
export class DialogEliminarComponent implements OnInit {

    constructor(
        private artistasService: ArtistasService,
        private fbStorage: StorageService,
        public dialogRef: MatDialogRef<DialogEliminarComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Artista
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
    async eliminarEvento(id: string) {
        let directorio = this.data.carpeta;
        if (this.data.imagen.url === "assets/default-lugar-galeria.jpg") {
            this.artistasService.deleteArtista(id);
        }
        //borra la imagen del evento de fire storage
        else {
            try {
                const clearImagen = await this.fbStorage.borrarArchivoStorage(`eventos/${directorio}`, this.data.imagen.name);
            } catch (error) {
                console.log('Se produjo un error al intentar eliminar la imágen ' + this.data.imagen.name + '. Error: ' + error);
            }
            this.artistasService.deleteArtista(id);
        }
    }
}
