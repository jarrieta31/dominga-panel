import { Component, OnInit } from '@angular/core';
import { LugaresService } from '../../services/lugares.service';
import { Lugar } from '../../interfaces/lugar.interface';
import { Item } from '../../interfaces/item.interface';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.css']
})
export class ListadoComponent implements OnInit {

  lugares: Lugar[] = [];
  items: any[] = [];

  constructor(private lugaresService: LugaresService ) { }

  ngOnInit(): void {
    console.log("hola desde listado");
    
    this.lugaresService.getLugares()
      .subscribe( lugares =>  this.items = lugares );
    
  }

}
