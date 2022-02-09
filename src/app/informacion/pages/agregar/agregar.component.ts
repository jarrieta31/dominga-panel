import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { ValidatorService } from '../../../shared/services/validator.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Imagen } from 'src/app/shared/interfaces/imagen.interface'
import { Observable, Subscription, Subject } from 'rxjs';
import { ConfigService } from '../../../shared/services/config.service';
import { MatDialog } from '@angular/material/dialog';
import { Informacion } from '../../interfaces/informacion.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap, takeUntil } from 'rxjs/operators';
import { DialogPublicarComponent } from '../../components/dialog-publicar/dialog-publicar.component';
import { InformacionService } from '../../services/informacion.service';

@Component({
    selector: 'app-agregar',
    templateUrl: './agregar.component.html',
    styleUrls: ['./agregar.component.css']
})
export class AgregarComponent implements OnInit {

    cambiosConfirmados: boolean = false;
    departamentos: string[] = [];
    directorio: string = ''; //subcarpeta con el nombre del lugar
    directorioPadre: string = 'informacion'; //carpeta raíz donde se almacenan los lugares
    idInformacion: string;
    localidades: string[] = [];
    titulo: string = "Nueva Información";
    listInfo: Informacion[] = [];
    page: number = 1;
    private unsubscribe$ = new Subject<void>();

    public infoForm: FormGroup = this.fb.group({
        departamento: ['', Validators.required],
        localidad: ['', [Validators.required]],
        categoria: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        publicado: [false],
        datos: this.fb.array([
            this.fb.group({
                nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
                telefono: [null, [this.vs.validarTelefono]]
            })
        ]),
    });

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private vs: ValidatorService,
        private _snackBar: MatSnackBar,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        private configService: ConfigService,
        private infoService: InformacionService,
    ) { }

    ngOnInit(): void {
        this.configService.getObsDepartamentos()
            .pipe( takeUntil( this.unsubscribe$ ) )
            .subscribe(dptos => this.departamentos = dptos)
        this.configService.getObsLocalidades()
            .pipe(takeUntil( this.unsubscribe$ ))
            .subscribe(locs => this.localidades = locs);
        this.infoService.getObsInformacion$()
            .pipe(takeUntil( this.unsubscribe$ ))
            .subscribe(informacion => this.listInfo = informacion);
        this.configService.emitirDepartamentosActivos();
        this.configService.emitirLocalidades();
        this.infoService.emitirInformacion();

        /**
        * A partir de la ruta y el id recibido obtiene el lugar para mostrar 
        */
        this.activatedRoute.params.pipe(
            switchMap(({ id }) => this.infoService.getInformacionId(id))
            //    tap(res => console.log(res))
        ).subscribe(info => {
            let infoActual: Informacion = JSON.parse(JSON.stringify(info));
            if (infoActual.id !== undefined) {//Si estamos editando un lugar
                this.idInformacion = infoActual.id;
                delete infoActual.id //para setear el formulario es necesario quitar el tatributo id
                for (let i = 0; i < infoActual.datos.length; i++) {
                    if (i > 0) {
                        this.agregarNuevoTelefonoAlFormulario()
                    }
                }
                this.infoForm.reset(infoActual);
                this.titulo = `Editando ${this.infoForm.controls['categoria'].value}`;
                this.configService.getLocadidadesDepartamento(infoActual.departamento);
            } else {
            }
        });

    }

    ngAfterViewInit(): void {
        //es para que no se vea el error de cambio
        this.cdRef.detectChanges();
    }

    OnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    /**
     * Función para prevenir la publicación de un lugar sin los datos indispensables
     * para la app
     */
    switchPublicar() {
        let test: boolean = true;
        let _descripcion: string = "OK";
        if (!test) {
            this.dialog.open(DialogPublicarComponent, {
                data: {
                    descripcion: _descripcion
                },
            });
        }
    }

    regresar() {
        this.router.navigate(['/informacion/listado']);
    }

    quitarEspacios() {

    }


    /** No se está usando ahora
         * Función para mostrar un mensaje corto al usuario 
         * @param message Es el texto que se muestra en el snackBar
         */
    openSnackBarSubmit(message: string) {
        this._snackBar.open(message, "Aceptar", {
            duration: 5000
        });
    }

    /** 
     * Este método es llamado cada vez que se selecciona un departamento
     */
    getLocalidadesPorDepartamento() {
        this.configService.getLocadidadesDepartamento(this.departamento.value)
    }


    /** Enviar en formulario a firebase */
    async submitEvento() {
        if (this.publicado.value === true) {
            this.switchPublicar();
        }
        //envia el formulario
        if (this.infoForm.valid) {
            this.cambiosConfirmados = true;
            //verifica si es una actualización o un restoran nuevo
            if (this.idInformacion !== undefined) {//si se esta editando un restoran
                const info: Informacion = this.infoForm.value;
                info.id = this.idInformacion;
                this.infoService.updateInformacionLocal(info);
                this.infoService.updateInformacionFirestore(this.infoForm.value, this.idInformacion)
                    .then(res => {
                        this.openSnackBarSubmit('¡La informacion se ha actualizado correctamente!');
                    })
                    .catch(error => {
                        this.openSnackBarSubmit('¡Error, no se ha podido actualizar la información en Firestore!');
                        console.error('¡Error, no se ha podido actualizar la información en Firestore!. Error: ' + error);
                    });
                this.regresar();
            } else { //Si el Informacion es nuevo
                let nuevoId: string;
                this.infoService.addInformacion(this.infoForm.value).then(id => {
                    nuevoId = id
                    if (nuevoId !== '' && nuevoId !== undefined) {
                        this.openSnackBarSubmit('¡El nuevo restaurante se ha guardado correctamente con el ID: ' + nuevoId);
                    }
                }).catch(error => {
                    console.log(error);
                    this.openSnackBarSubmit('¡Por algún motivo el nuevo restaurante no se pudo guardar!');
                })
                this.regresar();
            }
        }
    }

    /**
     * Función que agrega un nuevo formControl de tipo telefono
     */
    agregarNuevoTelefonoAlFormulario() {
        const telefonosControl = this.infoForm.get('datos') as FormArray;
        telefonosControl.push(
            this.fb.group({
                nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
                telefono: [null, [this.vs.validarTelefono]]
            })
        )
    }

    eliminarTelefonoDelFormulario(i: number) {
        const telefonosControl = this.infoForm.get('datos') as FormArray;
        telefonosControl.removeAt(i);
    }

    // Getters
    get departamento() { return this.infoForm.get('departamento'); }
    get localidad() { return this.infoForm.get('localidad'); }
    get categoria() { return this.infoForm.get('categoria')};
    get publicado() { return this.infoForm.get('publicado'); }
    get datos() { return this.infoForm.get('datos') as FormArray; }

}
