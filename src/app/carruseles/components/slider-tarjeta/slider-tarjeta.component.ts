import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Slider } from '../../interfaces/slider.interface';
import { tap } from 'rxjs/operators'
import { DialogEliminarComponent } from '../dialog-eliminar/dialog-eliminar.component';

@Component({
  selector: 'app-slider-tarjeta',
  templateUrl: './slider-tarjeta.component.html',
  styleUrls: ['./slider-tarjeta.component.css']
})
export class SliderTarjetaComponent implements OnInit {

    @Input() slider: Slider;
    @Output() onEditSlider: EventEmitter<Slider> = new EventEmitter(); 

    constructor(
        public dialog: MatDialog,
    ) { }

    ngOnInit(): void {
    }

    /**
     * Emite el slider actual para recibirlo en la pagina del carrusel padre para editarlo
     */
    editar(){
        this.onEditSlider.emit(this.slider);
    }


    /**
     * Abre el diaglogo para confimar la eliminación de un lugar
     * @param evento
     */
    openDialog() {
        const dialogRef = this.dialog.open(DialogEliminarComponent, {
            data: this.slider
        });

        dialogRef.afterClosed().pipe(
            tap(res => { console.log(res) })
        ).subscribe(result => {
            console.log(`Al cerrar dialog eliminar: ${result}`);
        });
    }

}
