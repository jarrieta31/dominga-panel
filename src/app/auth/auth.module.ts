import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './pages/login/login.component';
import { ResgistroComponent } from './pages/resgistro/resgistro.component';
import { AuthRoutingModule } from './auth-routing.module';


@NgModule({
  declarations: [
    LoginComponent,
    ResgistroComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
