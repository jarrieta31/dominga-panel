import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AgregarComponent } from './pages/agregar/agregar.component';
import { DondeComerComponent } from './pages/donde-comer/donde-comer.component';
import { ListadoComponent } from './pages/listado/listado.component';
import { HomeComponent } from '../lugares/pages/home/home.component';

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
                path: ':id',
                component: DondeComerComponent
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
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ]
})
export class DondeComerRoutingModule { }
