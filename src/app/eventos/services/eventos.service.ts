import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/compat/firestore';
import { Timestamp } from "firebase/firestore";
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { Evento } from '../interfaces/evento.interface';
import { BehaviorSubject, Observable, from } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EventosService {
    private eventos$: BehaviorSubject<Evento[]>;
    private eventos: Evento[] = []; //copia activa local de todos los lugares para trabajar con ella
    private idNuevoEvento: string = '';
    private mapCache = new Map();
    departamento: string = "San José";

    constructor(
        private afs: AngularFirestore,
        private ls: LocalStorageService,
    ) {
        this.eventos$ = new BehaviorSubject(this.eventos);
    }

    /** 
     * Obtiene todos los eventos desde firestore y los almacena en eventos[] para 
     * no estar consultado la base y minimizar el traficio.
     */
    getEventosFirestore(dpto: string) {

        if (!this.mapCache.has(dpto)) {
            console.log("get eventos " + dpto + " desde firestore")
            //this.afs.collection('eventos').ref.where('departamento', "==", dpto).where('fechaFin', ">=", Timestamp.fromDate(fechaActual) ).orderBy('fechaFin').get().then(
            this.afs.collection('eventos').ref.where('departamento', "==", dpto).get().then(
                querySnapshot => {
                    let arrEventos: Evento[] = [];
                    querySnapshot.forEach(item => {
                        const data: any = item.data()
                        arrEventos.push({ id: item.id, ...data });
                    })
                    this.mapCache.set(dpto, arrEventos.slice());
                    this.eventos = arrEventos.slice();
                    //this.eventos$.next(this.eventos); //el subject lugares$ emite los lugares
                    this.getEventosFiltrados()
                }
            ).catch(error => {
                console.error("Error en getEventosFirestore(). error:" + error);
            });
        } else {
            console.log("get eventos " + dpto + " desde la cache de lugares")
            let arrEventos: Evento[] = [];
            arrEventos = this.mapCache.get(dpto);
            this.eventos = arrEventos.slice();
            this.getEventosFiltrados()
            //this.eventos$.next(this.eventos)
        }

    }

    getEventosFiltrados() {
        // Por departamento
        if (this.ls.localidad === '' && this.ls.activos === 'todos' && this.ls.publicado === 'todos') {
            this.eventos$.next(this.eventos)
        }
        // Departamento y Publidados
        else if (this.ls.localidad === '' && this.ls.activos === 'todos' && this.ls.publicado !== 'todos') {
            let p: boolean = this.ls.publicado === 'publicados' ? true : false;
            this.eventos$.next(this.eventos.filter(evento =>
                evento.publicado == p
            ));
        }
        // Departamentos y Activos
        else if (this.ls.localidad === '' && this.ls.activos !== 'todos' && this.ls.publicado === 'todos') {
            if (this.ls.activos === 'activos') {
                this.eventos$.next(this.eventos.filter(evento =>
                    evento.fechaFin.seconds >= Timestamp.fromDate(new Date).seconds
                ));
            }
            else if (this.ls.activos === 'inactivos') {
                this.eventos$.next(this.eventos.filter(evento =>
                    evento.fechaFin.seconds < Timestamp.fromDate(new Date).seconds
                ));
            }
        }
        // Departamento, Activos y Publicados 
        else if (this.ls.localidad === '' && this.ls.activos !== 'todos' && this.ls.publicado !== 'todos') {
            let p: boolean = this.ls.publicado === 'publicados' ? true : false;
            if (this.ls.activos === 'activos') {
                this.eventos$.next(this.eventos.filter(evento =>
                    evento.publicado == p && evento.fechaFin.seconds >= Timestamp.fromDate(new Date).seconds
                ));
            }
            else if (this.ls.activos === 'inactivos') {
                this.eventos$.next(this.eventos.filter(evento =>
                    evento.publicado == p && evento.fechaFin.seconds < Timestamp.fromDate(new Date).seconds
                ));
            }
        }
        // Departamento y Localidad 
        else if (this.ls.localidad !== '' && this.ls.activos === 'todos' && this.ls.publicado === 'todos') {
            this.eventos$.next(this.eventos.filter(evento =>
                evento.localidad === this.ls.localidad
            ));
        }
        // Departamento, Localidad y Publidados
        else if (this.ls.localidad !== '' && this.ls.activos === 'todos' && this.ls.publicado !== 'todos') {
            let p: boolean = this.ls.publicado === 'publicados' ? true : false;
            this.eventos$.next(this.eventos.filter(evento =>
                evento.localidad === this.ls.localidad && evento.publicado == p
            ));
        }
        //Departamento Localidad y Activo
        else if (this.ls.localidad !== '' && this.ls.activos !== 'todos' && this.ls.publicado === 'todos') {
            if (this.ls.activos === 'activos') {
                this.eventos$.next(this.eventos.filter(evento =>
                    evento.localidad == this.ls.localidad && evento.fechaFin.seconds >= Timestamp.fromDate(new Date).seconds
                ));
            }
            else if (this.ls.activos === 'inactivos') {
                this.eventos$.next(this.eventos.filter(evento =>
                    evento.localidad == this.ls.localidad && evento.fechaFin.seconds < Timestamp.fromDate(new Date).seconds
                ));
            }
        }
        //Departamento Localidad Activos y Publicados
        else if (this.ls.localidad !== '' && this.ls.activos !== 'todos' && this.ls.publicado !== 'todos') {
            let p: boolean = this.ls.publicado === 'publicados' ? true : false;
            if (this.ls.activos === 'activos') {
                this.eventos$.next(this.eventos.filter(evento =>
                    evento.localidad == this.ls.localidad && evento.fechaFin.seconds >= Timestamp.fromDate(new Date).seconds && evento.publicado == p
                ));
            }
            else if (this.ls.activos === 'inactivos') {
                this.eventos$.next(this.eventos.filter(evento =>
                    evento.localidad == this.ls.localidad && evento.fechaFin.seconds < Timestamp.fromDate(new Date).seconds && evento.publicado == p
                ));
            }
        }
    }


    /** Obtiene el evento a partir del id que recibe y */
    getEventoId(id: string): Observable<Evento> {
        const eventoEncontrado = this.eventos.filter(item => item.id == id);
        return from(
            eventoEncontrado
        );
    }

    /**
     * Agrega un evento en firestore, obteniendo el id resultante para luego insertarlo en el 
     * array local eventos.
     * @param evento Contiene la información del nuevo evento.
     * @returns Retorna el ID del evento obtenido de firestore
     */
    async addEvento(evento: Evento): Promise<string> {
        let nuevoId: string;
        try {
            const documentRef = await this.afs.collection('eventos').add(evento)
            nuevoId = documentRef.id;
            evento.id = nuevoId;
            this.eventos.push(evento);
            this.mapCache.set(evento.departamento, this.eventos);
        } catch (error) {
            console.error("Se produjo un error al agregar un nuevo evento. Error: " + error);
        }
        return new Promise((resolve, reject) => {
            if (nuevoId !== undefined && nuevoId.length > 0) {
                resolve(nuevoId)
            } else {
                reject("No se puedo obtener el ID")
            }
        })
    }

    /**
     * Actuliza la información de lugar en la nube de Firestore, utilizando el método destructivo "set" (borra todo lo que este y 
     * guarda solo los valores actuales).
     * @param lugar Contiene todos los datos del lugar menos el ID.
     * @returns 
     */
    updateEventoFirestore(evento: Evento, id: string): Promise<any> {
        return this.afs.doc<Evento>(`eventos/${id}`).set(evento); //en ves de pasar el lugar completo se puede poner campo por campo        
    }

    /**
     * Actualiza la información de un lugar ya existente en el array local lugares.
     * @param data Es la data con toda la información del lugar includio el ID
     */
    updateEventoLocal(data: Evento) {
        let i = this.eventos.findIndex(evento => evento.id === data.id);
        this.eventos[i] = JSON.parse(JSON.stringify(data));
        this.mapCache.set(data.departamento, this.eventos);
    }

    getCache(nombreDpto: string): Evento[] {
        return this.mapCache.get(nombreDpto);
    }

    /**
     * Obtiene el observable del Subject eventos$ con la lista de todos los eventos.
     * @returns {Observable}
     */
    getObsEventos$(): Observable<Evento[]> {
        return this.eventos$.asObservable();
    }

    emitirEventos() {
        this.eventos$.next(this.eventos);
    }

    /** Elimina correctamente el evento */
    deleteEvento(id: string) {
        let indiceEliminar = this.eventos.findIndex(item => item.id === id);
        this.afs.collection('eventos').doc(id).delete().then(res => {
            this.eventos.splice(indiceEliminar, 1);
            this.emitirEventos();
            console.log("Evento eliminado correntamente")
        }).catch(err => {
            console.error("Se produjo un error al intentar eliminar un el evento " + id + ". Error:" + err)
        })
    }

    /** 
     * test Ok: Filtra lugares por departamento en el array local lugares. La lista 
     * resultante es emitida desde el Subject lugares$. 
     * @param {String} departamento Nombre del departamento por el cual se realiza la busqueda.
     */
    getEventosPorDepartamento(departamento: string): void {
        let eventosDepartamento = this.eventos.filter(evento => evento.departamento === departamento);
        this.eventos$.next(eventosDepartamento);
    }

    /** OK: Filtra por el estado de publicacion y por el departamento, luego 
     * actualiza el Subject  lugares$
      */
    getEventosPublicadoYDepartamento(pub: boolean, depto: string): void {
        this.eventos$.next(
            this.eventos.filter(evento => {
                if (evento.publicado === pub && evento.departamento === depto) {
                    return true;
                } else {
                    return false;
                }
            })
        );
    }

    getEventosPublicadoDepartamentoLocalidad(pub: boolean, dpto: string, loc: string) {
        this.eventos$.next(
            this.eventos.filter(evento => {
                if (evento.publicado === pub && evento.departamento === dpto && evento.localidad === loc) {
                    return true;
                } else {
                    return false;
                }
            })
        );
    }

    getEventosLocalidad(loc: string) {
        let eventosLocalidad = this.eventos.filter(evento => evento.localidad === loc);
        this.eventos$.next(eventosLocalidad);
    }

    /**
     *  Función para generar string random, se utilizar para crear el nombre de la carpeta
     * que almacena las imagenes. Funciona como un id. 
     * @param length Es largo que queremos el string.
     * @returns Retorna un string random.
     */
    randomString(length: number): string {
        var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        return result;
    }
}
