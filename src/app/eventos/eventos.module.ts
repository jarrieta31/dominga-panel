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
import { RecortarParrafoPipe } from './pipes/recortar-parrafo.pipe';
import { FechaHoraPipe } from './pipes/fecha-hora.pipe';




@NgModule({
    declarations: [
        AgregarComponent,
        DialogEliminarComponent,
        EventoComponent,
        EventoTarjetaComponent,
        ImagenPipe,
        ListadoComponent,
        RecortarParrafoPipe,
        DialogPublicarComponent,
        FechaHoraPipe
    ],
    imports: [
        AngularEditorModule,
        CommonModule,
        EventosRoutingModule,
        FlexLayoutModule,
        HttpClientModule,
        MaterialModule,
        ReactiveFormsModule,
        SharedModule,
    ]
})
export class EventosModule { }
