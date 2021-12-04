import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorPageComponent } from './shared/error-page/error-page.component';

const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'lugares',
        loadChildren: () => import('./lugares/lugares.module').then(m => m.LugaresModule)
    },
    {
        path: 'eventos',
        loadChildren: () => import('./eventos/eventos.module').then(m => m.EventosModule)
    },
    {
        path: 'donde-dormir',
        loadChildren: () => import('./donde-dormir/donde-dormir.module').then(m => m.DondeDormirModule)
    },
    {
        path: 'donde-comer',
        loadChildren: () => import('./donde-comer/donde-comer.module').then(m => m.DondeComerModule)
    },
    {
        path: 'artistas',
        loadChildren: () => import('./artistas/artistas.module').then(m => m.ArtistasModule)
    },
    {
        path: '404',
        component: ErrorPageComponent
    },
    {
        path: '**',
        redirectTo: '/lugares/listado'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
