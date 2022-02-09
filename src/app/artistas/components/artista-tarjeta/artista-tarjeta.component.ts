import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Artista } from '../../interfaces/artista.interface';
import { tap } from 'rxjs/operators'
import { DialogEliminarComponent } from '../dialog-eliminar/dialog-eliminar.component';

@Component({
    selector: 'app-artista-tarjeta',
    templateUrl: './artista-tarjeta.component.html',
    styleUrls: ['./artista-tarjeta.component.css']
})
export class ArtistaTarjetaComponent implements OnInit {

    @Input() artista: Artista;


    constructor(
        public dialog: MatDialog,
    ) { }

    ngOnInit(): void {
    }


    /**
     * Abre el diaglogo para confimar la eliminación de un lugar
     * @param artista
     */
    openDialog() {
        const dialogRef = this.dialog.open(DialogEliminarComponent, {
            data: this.artista
        });

        dialogRef.afterClosed().pipe(
            tap(res => { console.log(res) })
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

}
