import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';

//Modulos Propios
import { DondeDormirRoutingModule } from './donde-dormir-routing.module';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';

//Otros Modulos
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxPaginationModule } from 'ngx-pagination'; 

//Paginas
import { ListadoComponent } from './pages/listado/listado.component';
import { AgregarComponent } from './pages/agregar/agregar.component';
import { DondeDormirComponent } from './pages/donde-dormir/donde-dormir.component';

//Componentes
import { DialogEliminarComponent } from './components/dialog-eliminar/dialog-eliminar.component';
import { DialogPublicarComponent } from './components/dialog-publicar/dialog-publicar.component';
import { DondeDormirTarjetaComponent } from './components/donde-dormir-tarjeta/donde-dormir-tarjeta.component';

//Pipes
import { ImagenPipe } from './pipes/imagen.pipe';
import { FiltrosPipe } from './pipes/filtros.pipe';

@NgModule({
    declarations: [
        AgregarComponent,
        DialogEliminarComponent,
        DondeDormirComponent,
        DondeDormirTarjetaComponent,
        ListadoComponent,
        FiltrosPipe,
        DialogPublicarComponent,
        ImagenPipe,
    ],
    imports: [
        CommonModule,
        DondeDormirRoutingModule,
        FlexLayoutModule,
        FormsModule,
        MaterialModule,
        NgxPaginationModule,
        ReactiveFormsModule,
        SharedModule,
    ]
})
export class DondeDormirModule { }
