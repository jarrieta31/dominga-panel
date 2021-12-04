import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AgregarComponent } from './pages/agregar/agregar.component';
import { BuscarComponent } from './pages/buscar/buscar.component';
import { ListadoComponent } from './pages/listado/listado.component';
import { LugarComponent } from './pages/lugar/lugar.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent, //ruta padre
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
                path: 'buscar',
                component: BuscarComponent
            },
            {
                path: ':id',
                component: LugarComponent
            },
            {
                path: '**',
                redirectTo: '/404'
            }
        ]
    }
]

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
export class LugaresRoutingModule { }
