import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

//
import { AgregarComponent } from './pages/agregar/agregar.component';
import { DondeDormirComponent } from './pages/donde-dormir/donde-dormir.component';
import { HomeComponent } from '../lugares/pages/home/home.component';
import { ListadoComponent } from './pages/listado/listado.component';

const routes:Routes = [
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
        component: DondeDormirComponent
      },
      {
        path: '**',
        redirectTo: '404'
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
export class DondeDormirRoutingModule { }
