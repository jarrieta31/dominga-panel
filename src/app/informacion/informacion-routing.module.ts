import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '../lugares/pages/home/home.component';
import { ListadoComponent } from './pages/listado/listado.component';
import { AgregarComponent } from './pages/agregar/agregar.component';

const routes: Routes = [{
    path: '',
    component: HomeComponent,
    children: [
        {
            path: 'listado',
            component: ListadoComponent
        },
        {
            path: 'agregar',
            component: AgregarComponent
        },
        {
            path: 'editar/:id',
            component: AgregarComponent
        },
        {
            path: '**',
            redirectTo: '/404'
        }
    ]
}]

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})

export class InformacionRoutingModule { }
