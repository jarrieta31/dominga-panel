import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ResgistroComponent } from './pages/resgistro/resgistro.component';
import { AngularFireAuthGuard, hasCustomClaim, redirectUnauthorizedTo, redirectLoggedInTo, loggedIn  } from '@angular/fire/compat/auth-guard';

//const adminOnly = () => hasCustomClaim('admin');
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/auth/login']);
const redirectLoggedInToLugares = () => redirectLoggedInTo(['/lugares/listado']);
//const belongsToAccount = (next) => hasCustomClaim(`account-${next.params.id}`);
//const redirectLoggedInTo = () => redirectLoggedInTo(['/lugares/listado']);

const routes:Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        component: LoginComponent,
//        canActivate: [AngularFireAuthGuard], 
//        data: { authGuardPipe:  redirectLoggedInToLugares}
      },
      {
        path: 'registro',
        component: ResgistroComponent
      },
      {
        path: '**',
        redirectTo: 'login'
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
export class AuthRoutingModule { }
