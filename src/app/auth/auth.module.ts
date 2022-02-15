import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './pages/login/login.component';
import { ResgistroComponent } from './pages/resgistro/resgistro.component';
import { AuthRoutingModule } from './auth-routing.module';
import { PERSISTENCE, LANGUAGE_CODE } from '@angular/fire/compat/auth';

import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

//Modulos propios
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';

//Otros Modulos
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
    declarations: [
        LoginComponent,
        ResgistroComponent
    ],
    imports: [
        CommonModule,
        AuthRoutingModule,
        MaterialModule,
        SharedModule,
        HttpClientModule,
        ReactiveFormsModule,
        FlexLayoutModule,
    ],
    providers: [
        { provide: LANGUAGE_CODE, useValue: 'es' },
        { provide: PERSISTENCE, useValue: 'local' },  //los valores posibles son: local, session, none
    ]
})
export class AuthModule { }
