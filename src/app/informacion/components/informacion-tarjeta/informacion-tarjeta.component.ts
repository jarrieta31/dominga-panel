import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Informacion } from '../../interfaces/informacion.interface';
import { tap } from 'rxjs/operators'
import { DialogEliminarComponent } from '../dialog-eliminar/dialog-eliminar.component';


@Component({
  selector: 'app-informacion-tarjeta',
  templateUrl: './informacion-tarjeta.component.html',
  styleUrls: ['./informacion-tarjeta.component.css']
})
export class InformacionTarjetaComponent implements OnInit {

    @Input() informacion: Informacion;
    largoTitulo:number = 26;

    constructor(
        public dialog: MatDialog,
    ) { }

    ngOnInit(): void {
    }


    /**
     * Abre el diaglogo para confimar la eliminación de la informacion
     * @param evento
     */
    openDialog() {
        const dialogRef = this.dialog.open(DialogEliminarComponent, {
            data: this.informacion
        });

        dialogRef.afterClosed().pipe(
            tap(res => { console.log(res) })
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

}
