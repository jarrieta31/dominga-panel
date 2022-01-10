import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

//Modulos Propios
import { DondeComerRoutingModule } from './donde-comer-routing.module';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';

//Otros Modulos
import { FlexLayoutModule } from '@angular/flex-layout';

//Paginas y componentes 
import { AgregarComponent } from './pages/agregar/agregar.component';
import { DondeComerComponent } from './pages/donde-comer/donde-comer.component';
import { ListadoComponent } from './pages/listado/listado.component';

//Componentes
import { DialogEliminarComponent } from './components/dialog-eliminar/dialog-eliminar.component';
import { DondeComerTarjetaComponent } from './components/donde-comer-tarjeta/donde-comer-tarjeta.component';
import { DialogPublicarComponent } from './components/dialog-publicar/dialog-publicar.component';

//Pipes
import { ImagenPipe } from './pipes/imagen.pipe';


@NgModule({
    declarations: [
        AgregarComponent,
        DialogEliminarComponent,
        DondeComerComponent,
        DondeComerTarjetaComponent,
        ListadoComponent,
        DialogPublicarComponent,
        ImagenPipe,
    ],
    imports: [
        CommonModule,
        DondeComerRoutingModule,
        FlexLayoutModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        SharedModule,
    ]
})
export class DondeComerModule { }
