import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { Informacion } from '../interfaces/informacion.interface';

@Injectable({
  providedIn: 'root'
})
export class InformacionService {

    private informacion$: BehaviorSubject<Informacion[]>;
    private informacion: Informacion[] = []; 
    private idNuevoInformacion: string = '';
    private informacionRef = this.afs.collection('informacion');
    private mapCache = new Map();

    constructor(
        private afs: AngularFirestore,
        private ls: LocalStorageService,
    ) {
        this.informacion$ = new BehaviorSubject(this.informacion);
    }

    /** 
     * Obtiene todos los informacion desde firestore y los almacena en informacion[] para 
     * no estar consultado la base y minimizar el traficio.
     */
    getInformacionFirestore(dpto: string) {

        if (!this.mapCache.has(dpto)) {
            console.log("get informacion " + dpto + " desde firestore")
            //this.afs.collection('informacion').ref.where('departamento', "==", dpto).where('fechaFin', ">=", Timestamp.fromDate(fechaActual) ).orderBy('fechaFin').get().then(
            this.informacionRef.ref.where('departamento', "==", dpto).get().then(
                querySnapshot => {
                    let arrInfo: Informacion[] = [];
                    querySnapshot.forEach(item => {
                        const data: any = item.data()
                        arrInfo.push({ id: item.id, ...data });
                    })
                    this.mapCache.set(dpto, arrInfo.slice());
                    this.informacion = arrInfo.slice();
                    //this.informacion$.next(this.informacion); //el subject lugares$ emite los lugares
                    this.getInformacionFiltrados()
                }
            ).catch(error => {
                console.error("Error en getInformacionFirestore(). error:" + error);
            });
        } else {
            console.log("get informacion " + dpto + " desde la cache de Informacion")
            let arrInfo: Informacion[] = [];
            arrInfo = this.mapCache.get(dpto);
            this.informacion = arrInfo.slice();
            this.getInformacionFiltrados()
            //this.informacion$.next(this.informacion)
        }

    }

    getInformacionFiltrados() {
        // Por departamento
        if (this.ls.localidad === '' && this.ls.publicado === 'todos') {
            this.informacion$.next(this.informacion)
        }
        // Departamento y Publidados
        else if (this.ls.localidad === '' && this.ls.publicado !== 'todos') {
            let p: boolean = this.ls.publicado === 'publicados' ? true : false;
            this.informacion$.next(this.informacion.filter(info =>
                info.publicado == p
            ));
        }
        // Departamento y Localidad 
        else if (this.ls.localidad !== '' && this.ls.publicado === 'todos') {
            this.informacion$.next(this.informacion.filter(info =>
                info.localidad === this.ls.localidad
            ));
        }
        // Departamento, Localidad y Publidados
        else if (this.ls.localidad !== '' && this.ls.publicado !== 'todos') {
            let p: boolean = this.ls.publicado === 'publicados' ? true : false;
            this.informacion$.next(this.informacion.filter(info =>
                info.localidad === this.ls.localidad && info.publicado == p
            ));
        }
    }


    /** Obtiene el Informacion a partir del id que recibe y */
    getInformacionId(id: string): Observable<Informacion> {
        const inforEncontrada = this.informacion.filter(item => item.id == id);
        return from(
          inforEncontrada
        );
    }

    /**
     * Agrega un Informacion en firestore, obteniendo el id resultante para luego insertarlo en el 
     * array local informacion.
     * @param Informacion Contiene la información del nuevo Informacion.
     * @returns Retorna el ID del Informacion obtenido de firestore
     */
    async addInformacion(info: Informacion): Promise<string> {
        let nuevoId: string;
        try {
            const documentRef = await this.informacionRef.add(info)
            nuevoId = documentRef.id;
            info.id = nuevoId;
            this.informacion.push(info);
            this.mapCache.set(info.departamento, this.informacion);
        } catch (error) {
            console.error("Se produjo un error al agregar un nuevo Informacion. Error: " + error);
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
    updateInformacionFirestore(info: Informacion, id: string): Promise<any> {
        return this.afs.doc<Informacion>(`informacion/${id}`).set(info); //en ves de pasar el lugar completo se puede poner campo por campo        
    }

    /**
     * Actualiza la información de un lugar ya existente en el array local lugares.
     * @param data Es la data con toda la información del lugar includio el ID
     */
    updateInformacionLocal(data: Informacion) {
        let i = this.informacion.findIndex(info => info.id === data.id);
        this.informacion[i] = JSON.parse(JSON.stringify(data));
        this.mapCache.set(data.departamento, this.informacion);
    }

    getCache(nombreDpto: string): Informacion[] {
        return this.mapCache.get(nombreDpto);
    }

    /**
     * Obtiene el observable del Subject informacion$ con la lista de todos los informacion.
     * @returns {Observable}
     */
    getObsInformacion$(): Observable<Informacion[]> {
        return this.informacion$.asObservable();
    }

    emitirInformacion() {
        this.informacion$.next(this.informacion);
    }

    /** Elimina correctamente el Informacion */
    deleteInformacion(id: string) {
        let indiceEliminar = this.informacion.findIndex(item => item.id === id);
        this.informacionRef.doc(id).delete().then(res => {
            this.informacion.splice(indiceEliminar, 1);
            this.emitirInformacion();
            console.log("Informacion eliminado correntamente")
        }).catch(err => {
            console.error("Se produjo un error al intentar eliminar un el Informacion " + id + ". Error:" + err)
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
