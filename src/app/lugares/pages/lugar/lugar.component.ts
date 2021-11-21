import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lugar } from '../../interfaces/lugar.interface';
import { switchMap, tap } from 'rxjs/operators';
import { LugaresService } from '../../services/lugares.service';

@Component({
    selector: 'app-lugar',
    templateUrl: './lugar.component.html',
    styleUrls: ['./lugar.component.css']
})
export class LugarComponent implements OnInit {

    lugar!: Lugar;

    constructor(private activatedRoute: ActivatedRoute,
        private lugaresService: LugaresService,
        private router: Router) { }

    ngOnInit(): void {
        //A partir de la ruta y el id recibido obtento el lugar para mostrar
        this.activatedRoute.params.pipe(
            //tap(res => console.log(res)),
            switchMap(({ id }) => this.lugaresService.getLugarId(id)))
            .subscribe(lugar => {
                if ( lugar.id !== undefined ) {
                    this.lugar = lugar
                }else{
                    this.regresar();
                }
            });
    }

    regresar() {
        this.router.navigate(['/lugares/listado']);
    }

}
