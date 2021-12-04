import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//Modulos Propios
import { DondeDormirRoutingModule } from './donde-dormir-routing.module';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';

//Otros Modulos
import { FlexLayoutModule } from '@angular/flex-layout';

//Paginas
import { ListadoComponent } from './pages/listado/listado.component';
import { AgregarComponent } from './pages/agregar/agregar.component';
import { DondeDormirComponent } from './pages/donde-dormir/donde-dormir.component';

//Componentes
import { DialogEliminarComponent } from './components/dialog-eliminar/dialog-eliminar.component';

@NgModule({
    declarations: [
        AgregarComponent,
        DialogEliminarComponent,
        DondeDormirComponent,
        ListadoComponent,
    ],
    imports: [
        CommonModule,
        DondeDormirRoutingModule,
        FlexLayoutModule,
        SharedModule,
        MaterialModule,
    ]
})
export class DondeDormirModule { }
