import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Lugar } from '../../interfaces/lugar.interface';
import { LugaresService } from '../../services/lugares.service';

@Component({
  selector: 'app-lugar-tarjeta',
  templateUrl: './lugar-tarjeta.component.html',
  styleUrls: ['./lugar-tarjeta.component.css']
})
export class LugarTarjetaComponent  {

  @Input() lugar: Lugar;

  constructor( private lugaresService:LugaresService){}
  
  /** 
   * Borra un lugar de la base de datos, utilizando el servicio de lugares.
  */
  eliminarLugar(id:string){
    this.lugaresService.deleteLugar(id);
  }

}
