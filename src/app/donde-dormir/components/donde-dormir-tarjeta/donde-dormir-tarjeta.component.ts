import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Hotel } from '../../interfaces/hotel.interface';
import { tap } from 'rxjs/operators'
import { DialogEliminarComponent } from '../dialog-eliminar/dialog-eliminar.component';

@Component({
  selector: 'app-donde-dormir-tarjeta',
  templateUrl: './donde-dormir-tarjeta.component.html',
  styleUrls: ['./donde-dormir-tarjeta.component.css']
})
export class DondeDormirTarjetaComponent implements OnInit {

    @Input() hotel: Hotel;
    largoTitulo: number =  26;

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
            data: this.hotel
        });

        dialogRef.afterClosed().pipe(
            tap(res => { console.log(res) })
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

}
