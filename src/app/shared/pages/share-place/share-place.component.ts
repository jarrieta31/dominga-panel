import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { doc } from 'firebase/firestore';
import { Subject } from 'rxjs';
import { switchMap, tap, takeUntil } from 'rxjs/operators';
import { Lugar } from 'src/app/lugares/interfaces/lugar.interface';
import { LugaresService } from '../../../lugares/services/lugares.service';

@Component({
  selector: 'app-share-place',
  templateUrl: './share-place.component.html',
  styleUrls: ['./share-place.component.css']
})
export class SharePlaceComponent implements OnInit {

  lugar$: Subject<Lugar> = new Subject();
  lugar: Lugar;
  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private lugaresService: LugaresService,
    private router: Router
  ) { }

  ngOnInit(): void {
    //A partir de la ruta y el id recibido obtento el lugar para mostrar
    this.activatedRoute.params.pipe(
      switchMap(({ id }) => this.lugaresService.getLugarFirestore(id)),
      //takeUntil(this.destroy$)
    ).subscribe(docSnapshot => {
      if (docSnapshot.data() !== undefined) {
        this.lugar$.next(docSnapshot.data());
        this.lugar = docSnapshot.data(); 
      } else {
        this.router.navigate(['/404'])
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
