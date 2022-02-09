import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Evento } from '../../interfaces/evento.interface';
import { tap } from 'rxjs/operators'
import { DialogEliminarComponent } from '../dialog-eliminar/dialog-eliminar.component';

@Component({
    selector: 'app-evento-tarjeta',
    templateUrl: './evento-tarjeta.component.html',
    styleUrls: ['./evento-tarjeta.component.css']
})
export class EventoTarjetaComponent implements OnInit {

    @Input() evento: Evento;
    largoDescripcion: number = 120;
    largoTitulo:number = 23;

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
            data: this.evento
        });

        dialogRef.afterClosed().pipe(
            tap(res => { console.log(res)  })
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

}
