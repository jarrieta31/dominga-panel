import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DondeComerService } from '../../services/donde-comer.service';
import { Observable } from 'rxjs';
import { Restoran } from '../../interfaces/Restoran.interface';


@Component({
    selector: 'app-listado',
    templateUrl: './listado.component.html',
    styleUrls: ['./listado.component.css']
})
export class ListadoComponent implements OnInit {

    titulo: string = "Lista de Lugares donde comer";
    restaurantes$: Observable<Restoran[]>;

    constructor(
        private comerService: DondeComerService,
        private router: Router,
    ) { }


    ngOnInit(): void {
        this.restaurantes$ = this.comerService.getObsRestaurantes$();
        this.comerService.getRestaurantesFirestore("San Jose");
    }

    regresar() {
        this.router.navigate(["/donde-comer/listado"]);
    }

}
