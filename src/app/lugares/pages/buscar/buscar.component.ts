import { Component, OnInit } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Lugar } from '../../interfaces/lugar.interface';
import { LugaresService } from '../../services/lugares.service';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.component.html',
  styleUrls: ['./buscar.component.css']
})
export class BuscarComponent implements OnInit {

  termino: string = '';
  lugares: Lugar[] = [];
  lugarSeleccionado!: Lugar;
  
  constructor(private lugaresService: LugaresService) { }

  ngOnInit(): void {
  }

  buscando(){
    this.lugaresService.lugares$.subscribe(
      lugares => this.lugares = lugares
    )
  }

  //falta terminar
  opcionSeleccionada(event: MatAutocompleteSelectedEvent ){
    console.log(event);

  }

}
