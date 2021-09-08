import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Lugar } from '../../interfaces/lugar.interface';

@Component({
  selector: 'app-lugar-tarjeta',
  templateUrl: './lugar-tarjeta.component.html',
  styleUrls: ['./lugar-tarjeta.component.css']
})
export class LugarTarjetaComponent  {

  @Input() lugar!: Lugar;

}
