import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventosService } from '../../services/eventos.service';
import { Observable } from 'rxjs';
import { Evento } from '../../interfaces/evento.interface';

@Component({
    selector: 'app-listado',
    templateUrl: './listado.component.html',
    styleUrls: ['./listado.component.css']
})
export class ListadoComponent implements OnInit {

    titulo: string = "Lista de Eventos"; 
    eventos$: Observable<Evento[]>;

    constructor(
        private eventosService:EventosService,
        private router: Router,
    ) { }


    ngOnInit(): void {
        this.eventos$ = this.eventosService.getObsEventos$();
        this.eventosService.getEventosFirestore("San Jose");
    }

    regresar(){
        this.router.navigate(["/lugares/listado"]);
    }

}
