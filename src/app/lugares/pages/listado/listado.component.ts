import { Component, OnInit } from '@angular/core';
import { LugaresService } from '../../services/lugares.service';
import { Lugar, Departamento} from '../../interfaces/lugar.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.css']
})
export class ListadoComponent implements OnInit {

  lugares$: Observable<Array<Lugar>> = this.lugaresService.lugares$;
  panelOpenState = false;
  public departamentos = Object.values(Departamento);
  filtroDepartamento = false;
  filtroPublicado = false;

  constructor(private lugaresService: LugaresService) { }

  ngOnInit(): void {

    /**Descomentar la siguiente linea para cargar todos los lugares a firestore */
    //this.lugaresService.cargarLugares();

    /*
        this.lugaresService.getLugares()
          .subscribe( lugares =>  this.items = lugares );
    
    */

  }


}
