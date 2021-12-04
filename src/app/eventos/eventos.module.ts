import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//Modulos
import { EventosRoutingModule } from './eventos-routing.module';

//Paginas
import { ListadoComponent } from './pages/listado/listado.component';
import { AgregarComponent } from './pages/agregar/agregar.component';
import { EventoComponent } from './pages/evento/evento.component';
import { DialogEliminarComponent } from './components/dialog-eliminar/dialog-eliminar.component';



@NgModule({
  declarations: [
    ListadoComponent,
    AgregarComponent,
    EventoComponent,
    DialogEliminarComponent
  ],
  imports: [
    CommonModule,
    EventosRoutingModule
  ]
})
export class EventosModule { }
