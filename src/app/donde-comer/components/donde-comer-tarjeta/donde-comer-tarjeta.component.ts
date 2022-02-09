import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Restoran } from '../../interfaces/Restoran.interface';
import { tap } from 'rxjs/operators'
import { DialogEliminarComponent } from '../dialog-eliminar/dialog-eliminar.component';

@Component({
    selector: 'app-donde-comer-tarjeta',
    templateUrl: './donde-comer-tarjeta.component.html',
    styleUrls: ['./donde-comer-tarjeta.component.css']
})
export class DondeComerTarjetaComponent implements OnInit {


    @Input() restoran: Restoran;
    largoTitulo:number = 26;

    constructor(
        public dialog: MatDialog,
    ) { }

    ngOnInit(): void {
    }


    /**
     * Abre el diaglogo para confimar la eliminación de un lugar
     * @param evento
     */
    openDialog() {
        const dialogRef = this.dialog.open(DialogEliminarComponent, {
            data: this.restoran
        });

        dialogRef.afterClosed().pipe(
            tap(res => { console.log(res) })
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

}
