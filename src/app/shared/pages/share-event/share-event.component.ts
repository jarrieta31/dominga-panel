import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventosService } from '../../../eventos/services/eventos.service';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { Evento } from 'src/app/eventos/interfaces/evento.interface';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-share-event',
  templateUrl: './share-event.component.html',
  styleUrls: ['./share-event.component.css']
})
export class ShareEventComponent implements OnInit {

  evento$: Subject<Evento> = new Subject();
  evento: Evento;
  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private eventosService: EventosService,
    private router: Router, 
    private analitycs: AngularFireAnalytics,
    private title: Title,
  ) { }

  ngOnInit(): void {
    //A partir de la ruta y el id recibido obtento el lugar para mostrarla
    this.activatedRoute.params.pipe(
      switchMap(( {id} ) => this.eventosService.getEventoFirestore(id)),
      takeUntil(this.destroy$)
      ).subscribe(docSnapshot => {
        if (docSnapshot.data() !== undefined) {
        this.evento$.next(docSnapshot.data());
        this.evento = docSnapshot.data();

        this.analitycs.logEvent('event_seen', {"event_name": this.evento.nombre})
        this.title.setTitle(`Compartiendo ${this.evento.nombre}`)

        }else {
          this.router.navigate(['/404']);
        }

      })
  }

  navigatePlayStore(){
        //this.router.navigateByUrl("https://www.google.com");
    window.location.href="https://play.google.com/store/apps/details?id=io.ionic.domingo";
  }

  navigateAppleStore(){
    window.location.href="https://apps.apple.com/pa/app/domingo/id1533544868";
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
