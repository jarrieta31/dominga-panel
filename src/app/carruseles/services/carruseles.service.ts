import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { Slider } from '../interfaces/slider.interface';
import { BehaviorSubject, Observable, from } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CarruselesService {

    private sliders$: BehaviorSubject<Slider[]>;
    private sliders: Slider[] = []; //copia local de todos los sliders para trabajar con ella
    private mapCache = new Map();
    private slidersRef = this.afs.collection('sliders');
    pantallas = [
        { name: "Donde Comer" }, 
        { name: "Donde Dormir"}, 
        { name: "Informacion" }, 
        { name: "Artistas" }, 
        { name: "Eventos" }, 
        { name: "Lugares" }, 
    ];

    constructor(
        private afs: AngularFirestore,
        private ls: LocalStorageService,
    ) {
        this.sliders$ = new BehaviorSubject(this.sliders);
    }

    /** 
     * Obtiene todos los sliders desde firestore y los almacena en sliders[] para 
     * no estar consultado la base y minimizar el traficio.
     */
    getSliderFirestore(pantalla: string) {
        console.log(this.sliders.length)
        if ( !this.mapCache.has(pantalla) || this.sliders.length === 0) {
            console.log("get sliders desde firestore")
            this.slidersRef.ref.where('pantalla', '==', pantalla).get().then(
                querySnapshot => {
                    const arrSliders: Slider[] = [];
                    querySnapshot.forEach(item => {
                        const data: any = item.data()
                        arrSliders.push({ id: item.id, ...data });
                    })
                    this.mapCache.set(pantalla, arrSliders.slice());
                    this.sliders = arrSliders.slice();
                    this.sliders$.next(this.sliders);
                    //this.getRestaurantesFiltrados()

                }
            ).catch(error => {
                console.error("Error en getSlidersFirestore(). error:" + error);
            });
        } else {
            console.log("get sliders desde la cache")
            this.sliders = this.mapCache.get(pantalla);
            this.sliders$.next(this.sliders);
            //this.getSlidersFiltrados();
        }
    }

    /**
     * Función que realiza todos los filtros para sliders.
     * Los filtros se realizan sobre el array local de sliders.
     */
    getRestaurantesFiltrados() {
        
    }

    /** Obtiene el slider a partir del id que recibe y */
    getSliderId(id: string): Observable<Slider> {
        const restoranEncontrado = this.sliders.filter(item => item.id == id);
        return from(
            restoranEncontrado
        );
    }

    /**
     * Agrega un slider en firestore, obteniendo el id resultante para luego insertarlo en el 
     * array local sliders.
     * @param slider Contiene la información del nuevo slider.
     * @returns Retorna el ID del slider obtenido de firestore
     */
    async addSlider(slider: Slider): Promise<string> {
        let nuevoId: string;
        try {
            const documentRef = await this.slidersRef.add(slider)
            nuevoId = documentRef.id;
            slider.id = nuevoId;
            this.sliders.push(slider);
            this.mapCache.set(slider.pantalla, this.sliders);
        } catch (error) {
            console.error("Se produjo un error al agregar un nuevo slider. Error: " + error);
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
    updateSliderFirestore(slider: Slider, id: string): Promise<any> {
        return this.afs.doc<Slider>(`sliders/${id}`).set(slider); //en ves de pasar el lugar completo se puede poner campo por campo        
    }

    /**
     * Actualiza la información de un restuarente ya existente en el array local sliders.
     * Y actualiza la cache de sliders.
     * @param data Es la data con toda la información del lugar includio el ID
     */
    updateSliderLocal(data: Slider) {
        let i = this.sliders.findIndex(slider => slider.id === data.id);
        if( i !== -1){
            this.sliders[i] = JSON.parse(JSON.stringify(data));
            this.mapCache.set(data.pantalla, this.sliders);
        }
        this.getSliderFirestore(data.pantalla);
    }

    /**
     * Obtiene el observable del Subject sliders$ con la lista de todos los sliders.
     * @returns {Observable}
     */
    getObsSliders$(): Observable<Slider[]> {
        return this.sliders$.asObservable();
    }

    emitirSliders() {
        this.sliders$.next(this.sliders);
    }

    /** Elimina correctamente el slider */
    deleteSlider(id: string) {
        let indiceEliminar = this.sliders.findIndex(item => item.id === id);
        this.slidersRef.doc(id).delete().then(res => {
            this.sliders.splice(indiceEliminar, 1);
            this.emitirSliders();
            console.log("Slider eliminado correntamente")
        }).catch(err => {
            console.error("Se produjo un error al intentar eliminar un el slider " + id + ". Error:" + err)
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
