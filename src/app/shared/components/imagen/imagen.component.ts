import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Lugar, Imagen  } from 'src/app/lugares/interfaces/lugar.interface';

@Component({
  selector: 'app-imagen',
  templateUrl: './imagen.component.html',
  styleUrls: ['./imagen.component.css']
})
export class ImagenComponent implements OnInit {

  constructor() { }

  @Input() imagen: Imagen;
  @Output() imagenABorrar:EventEmitter<string> = new EventEmitter<string>();

  ngOnInit(): void {
  }

  removerImagen(imagen:string){

    this.imagenABorrar.emit(imagen);
  }

}
