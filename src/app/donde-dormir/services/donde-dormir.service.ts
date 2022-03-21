import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { Hotel } from '../interfaces/hotel.interface';
import { BehaviorSubject, Observable, from } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DondeDormirService {

    private hoteles$: BehaviorSubject<Hotel[]>;
    private hoteles: Hotel[] = []; //copia local de todos los hoteles para trabajar con ella
    private mapCache = new Map();
    private hotelesRef = this.afs.collection('donde_dormir');
    departamento: string = "San José";

    constructor(
        private afs: AngularFirestore,
        private ls: LocalStorageService,
    ) {
        this.hoteles$ = new BehaviorSubject(this.hoteles);
    }

    /** 
     * Obtiene todos los hoteles desde firestore y los almacena en hoteles[] para 
     * no estar consultado la base y minimizar el traficio.
     */
    getHotelesFirestore(dpto: string) {
        if (!this.mapCache.has(dpto) || this.hoteles.length === 0) {
            //        this.afs.collection('eventos').ref.where('departamento', "==", departament).where('prioridad', ">", -1).orderBy('prioridad').get().then(
            this.hotelesRef.ref.where('departamento', "==", dpto).get().then(
                querySnapshot => {
                    const arrRestaurantes: Hotel[] = [];
                    querySnapshot.forEach(item => {
                        const data: any = item.data()
                        arrRestaurantes.push({ id: item.id, ...data });
                    })
                    this.mapCache.set(dpto, arrRestaurantes.slice());
                    this.hoteles = arrRestaurantes.slice();
                    this.getHotelesFiltrados()
                }
            ).catch(error => {
                console.error("Error en getEventosFirestore(). error:" + error);
            });
        } else {
            console.log("get hoteles " + dpto + " desde la cache")
            this.hoteles = this.mapCache.get(dpto);
            this.getHotelesFiltrados();
        }
    }

    /**
     * Función que realiza todos los filtros para hoteles.
     * Los filtros se realizan sobre el array local de hoteles.
     */
    getHotelesFiltrados() {
        // Por departamento
        if (this.ls.localidad === '' && this.ls.publicado === 'todos') {
            this.hoteles$.next(this.hoteles)
        }
        // Departamento y Publidados
        else if (this.ls.localidad === '' && this.ls.publicado !== 'todos') {
            let p: boolean = this.ls.publicado === 'publicados' ? true : false;
            this.hoteles$.next(this.hoteles.filter(evento =>
                evento.publicado == p
            ));
        }
        // Departamento y Localidad 
        else if (this.ls.localidad !== '' && this.ls.publicado === 'todos') {
            this.hoteles$.next(this.hoteles.filter(evento =>
                evento.localidad === this.ls.localidad
            ));
        }
        // Departamento, Localidad y Publidados
        else if (this.ls.localidad !== '' && this.ls.activos === 'todos' && this.ls.publicado !== 'todos') {
            let p: boolean = this.ls.publicado === 'publicados' ? true : false;
            this.hoteles$.next(this.hoteles.filter(evento =>
                evento.localidad === this.ls.localidad && evento.publicado == p
            ));
        }
    }

    /** Obtiene el evento a partir del id que recibe y */
    geHotelId(id: string): Observable<Hotel> {
        const restoranEncontrado = this.hoteles.filter(item => item.id == id);
        return from(
            restoranEncontrado
        );
    }

    /**
     * Agrega un hotel en firestore, obteniendo el id resultante para luego insertarlo en el 
     * array local eventos.
     * @param hotel Contiene la información del nuevo evento.
     * @returns Retorna el ID del evento obtenido de firestore
     */
    async addHotel(hotel: Hotel): Promise<string> {
        let nuevoId: string;
        try {
            const documentRef = await this.hotelesRef.add(hotel)
            nuevoId = documentRef.id;
            hotel.id = nuevoId;
            this.hoteles.push(hotel);
            this.mapCache.set(hotel.departamento, this.hoteles);
        } catch (error) {
            console.error("Se produjo un error al agregar un nuevo hotel. Error: " + error);
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
    updateHotelFirestore(hotel: Hotel, id: string): Promise<any> {
        return this.afs.doc<Hotel>(`donde_dormir/${id}`).set(hotel); //en ves de pasar el lugar completo se puede poner campo por campo        
    }

    /**
     * Actualiza la información de un hotel ya existente en el array local hoteles.
     * Y actualiza la cache de hoteles.
     * @param data Es la data con toda la información del lugar includio el ID
     */
    updateHotelLocal(data: Hotel) {
        console.log("ID: " + data.id)
        let i = this.hoteles.findIndex(hotel => hotel.id === data.id);
        this.hoteles[i] = JSON.parse(JSON.stringify(data));
        this.mapCache.set(data.departamento, this.hoteles);
        //this.hoteles$.next(this.hoteles);
    }

    getCache(nombreDpto: string): Hotel[] {
        return this.mapCache.get(nombreDpto);
    }

    /**
     * Obtiene el observable del Subject hoteles$ con la lista de todos los hoteles.
     * @returns {Observable}
     */
    getObsHoteles$(): Observable<Hotel[]> {
        return this.hoteles$.asObservable();
    }

    emitirHoteles() {
        this.hoteles$.next(this.hoteles);
    }

    /** Elimina correctamente el evento */
    deleteHotel(id: string) {
        let indiceEliminar = this.hoteles.findIndex(item => item.id === id);
        this.hotelesRef.doc(id).delete().then(res => {
            this.hoteles.splice(indiceEliminar, 1);
            this.emitirHoteles();
            console.log("Evento eliminado correntamente")
        }).catch(err => {
            console.error("Se produjo un error al intentar eliminar un el evento " + id + ". Error:" + err)
        })
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
