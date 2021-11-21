import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Lugar } from '../../interfaces/lugar.interface';
import { LugaresService } from '../../services/lugares.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogEliminarComponent } from '../dialog-eliminar/dialog-eliminar.component';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-lugar-tarjeta',
    templateUrl: './lugar-tarjeta.component.html',
    styleUrls: ['./lugar-tarjeta.component.css']
})
export class LugarTarjetaComponent {

    @Input() lugar: Lugar;

    constructor(
        public dialog: MatDialog,
        private lugaresService: LugaresService,
        private _snackBar: MatSnackBar,
    ) { }


    /**
     * Abre el diaglogo para confimar la eliminación de un lugar
     * @param lugar 
     */
    openDialog(lugar: Lugar) {
        const dialogRef = this.dialog.open(DialogEliminarComponent, {
            data: lugar
        });

        dialogRef.afterClosed().pipe(
            tap(res => { console.log(res)  })
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }


}
