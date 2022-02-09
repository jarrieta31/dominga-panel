import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


//Modulos propios
import { EventosRoutingModule } from './eventos-routing.module';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';

//Otros Modulos
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgxPaginationModule } from 'ngx-pagination'; 

//Paginas
import { ListadoComponent } from './pages/listado/listado.component';
import { AgregarComponent } from './pages/agregar/agregar.component';
import { EventoComponent } from './pages/evento/evento.component';

//Components
import { DialogEliminarComponent } from './components/dialog-eliminar/dialog-eliminar.component';
import { EventoTarjetaComponent } from './components/evento-tarjeta/evento-tarjeta.component';
import { DialogPublicarComponent } from './components/dialog-publicar/dialog-publicar.component';

//Pipes
import { ImagenPipe } from './pipes/imagen.pipe';
import { RecortarParrafoPipe } from '../shared/pipes/recortar-parrafo.pipe';
import { FechaPipe } from './pipes/fecha.pipe';
import { HoraPipe } from './pipes/hora.pipe';
import { RecortarTituloPipe } from '../shared/pipes/recortar-titulo.pipe';
import { FiltrosPipe } from './pipes/filtros.pipe';




@NgModule({
    declarations: [
        AgregarComponent,
        DialogEliminarComponent,
        EventoComponent,
        EventoTarjetaComponent,
        ImagenPipe,
        ListadoComponent,
        DialogPublicarComponent,
        FechaPipe,
        HoraPipe,
        FiltrosPipe
    ],
    imports: [
        AngularEditorModule,
        CommonModule,
        EventosRoutingModule,
        FlexLayoutModule,
        HttpClientModule,
        MaterialModule,
        NgxPaginationModule,
        ReactiveFormsModule,
        SharedModule,
    ]
})
export class EventosModule { }
