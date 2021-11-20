import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { Lugar } from '../interfaces/lugar.interface';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/compat/firestore';
import { from, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { LugarComponent } from '../pages/lugar/lugar.component';



@Injectable({
    providedIn: 'root'
})
export class LugaresService {

    private lugaresCollection: AngularFirestoreCollection<Lugar[]>;
    private lugares$: Subject<Lugar[]>;
    private lugar$: Subject<Lugar>;
    private prioridades$: Subject<number[]>;
    private todosLosLugares: Lugar[] = [];

    constructor(private afs: AngularFirestore) {
        this.lugaresCollection = afs.collection<Lugar[]>('lugares');
        //this.lugares$ = this.lugaresCollection.valueChanges({ idField: 'id' });
        //const lugaresRef = this.afs.collection('lugares');
        this.lugares$ = new Subject();
        this.lugar$ = new Subject();
        this.getLugaresFirestore();
        this.prioridades$ = new Subject();

    }

    addLugar(lugar: Lugar) {
        this.afs.collection('lugares').add(lugar).then(res => {
            console.log(res)
        }).catch(error => {
            console.log("Error al agrear nuevo lugar. Error: " + error);
        })
    }

    /** 
     * Actualiza o crea la lista de de prioridades (Subject) contando los lugares, para mostrarla en el selector de prioridades
     * @param {Boolean} sumarUno Este valor sirve para saber si se está agregando un nuevo lugar o simplemente
     * se está actulizando la prioridad del lugar. Si es un nuevo lugar sumarUno debe ser true.
     */
    actualizarListaPrioridades(sumarUno: boolean) {
        let listPrioridades: number[] = [];
        if (sumarUno) { //si la lista es para crear un nuevo lugar se agrega 1
            for (let i = 0; i < this.todosLosLugares.length + 1; i++) {
                listPrioridades[i] = i+1;
            }
        } else { //si la lista es para actualizar la prioridad de un lugar existente
            for (let i = 0; i < this.todosLosLugares.length; i++) {
                listPrioridades[i] = i+1;
            }
        }
        console.log("update prioridades: "+ listPrioridades)
        this.prioridades$.next(listPrioridades);
    }

    /**
     * Cambia la posición u prioridad de un lugar, para que se muestre antes o despues en el array de todosLosLugares. 
     * @param {Lugar} lugar Recibe el lugar al que le vamos a cambiar la prioridad.
     * @param {Number} nuevaPrioridad Es el valor de la nueva prioridad o posición que debe estar en el array todosLosLugares.
     */
    cambiarPrioridadDeUnLugar(lugar:Lugar, nuevaPrioridad:number){
        this.todosLosLugares.splice(lugar.prioridad, 1);//elimina ese lugar de la posicion actual
        this.todosLosLugares.splice(nuevaPrioridad, 0, lugar);//Inserta el lugar en su nueva posición
        for(let i=0; i < this.todosLosLugares.length; i++){ //actualiza la prioridades del array para que correspondan con el indice
            this.todosLosLugares[i].prioridad = i+1;
        }

        this.lugares$.next(this.todosLosLugares);
    }

    /** Ordena el array local todosLosLugares */
    reordenarLugaresPorPrioridad() {
        this.todosLosLugares.sort(this.compararPrioridadLugares);
    }

    /** Funcion para comparar las prioridades de los lugares */
    compararPrioridadLugares(a: Lugar, b: Lugar): number {
        if (a.prioridad < b.prioridad) {
            return -1;
        }
        if (a.prioridad > b.prioridad) {
            return 1;
        }
        // a debe ser igual b
        return 0;
    }

    updateLugar(lugar: Lugar): Observable<void> {
        return from(
            this.afs.doc<Lugar>(`lugares/${lugar.id}`).update(lugar) //en ves de pasar el lugar completo se puede poner campo por campo
        );
    }

    /** 
     * Obtiene todos los lugares desde firestor y los almacena en todosLosLugares[] para 
     * no estar consultado la base y minimizar el traficio.
     */
    getLugaresFirestore() {
        this.afs.collection('lugares').ref.where('prioridad',">",-1).orderBy('prioridad').get().then(
            querySnapshot => {
                const arrLugares: any[] = [];
                querySnapshot.forEach(item => {
                    const data: any = item.data()
                    arrLugares.push({ id: item.id, ...data });
                })
                console.log("todosLosLugares.length = " + this.todosLosLugares.length)
                this.todosLosLugares = arrLugares.slice();
                this.actualizarListaPrioridades(false);
                console.log("todosLosLugares.length = " + this.todosLosLugares.length)
                this.lugares$.next(this.todosLosLugares); //el subject lugares$ emite los lugares
            }
        ).catch(error => {
            console.error("Error en getLugares(). error:" + error);
        }).finally(() => console.info("Corriendo getLugares() en lugares.services!"))
    }

    /**
     * Obtiene el observable del Subject lugares$ con la lista de todos los lugares.
     * @returns {Observable}
     */
    getObsLugares$(): Observable<Lugar[]> {
        return this.lugares$.asObservable();
    }

    /**
     * Obtiene el observable del Subject prioridades$ con la lista de prioridades.
     * @returns {Observable}
     */
    getObsPrioridades$(): Observable<number[]> {
        return this.prioridades$.asObservable();
    }

    /** Retorna un observable de un lugar obtenido localmente del array lugares */
    getObsLugar$(): Observable<Lugar> {
        return this.lugar$.asObservable();
    }

    getLugaresLocal() {
        this.lugares$.next(this.todosLosLugares);
    }

    /** Obtiene el lugar a partir del id que recibe y */
    getLugarId(id: string): Observable<Lugar> {
        const lugarEncontrado = this.todosLosLugares.filter(item => item.id == id);
        return from(
            //this.afs.doc(`lugares/${id}`).snapshotChanges() //funciona ok no se usa
            //this.afs.doc(id).get()                          //funciona ok no se usa
            lugarEncontrado
        );
    }

    /** 
     * test Ok: Filtra lugares por departamento en el array local todosLosLugares. La lista 
     * resultante es emitida desde el Subject lugares$. 
     * @param {String} departamento Nombre del departamento por el cual se realiza la busqueda.
     */
    getLugaresPorDepartamento(departamento: string): void {
        //si uso la consulta a firestore retorna un observable
        //return this.afs.collection('lugares', ref => ref.where('departamento', '==', departamento)).valueChanges({ idField: 'id' });
        this.lugares$.next(this.todosLosLugares.filter(lugar => lugar.departamento == departamento));
    }

    /** OK: Filtra por el estado de publicacion y retorna un obserbave  */
    getLugaresPorEstado(publicado: boolean): void {
        //si uso la consulta a firestore retorna un observable
        //return this.afs.collection('lugares', ref => ref.where('publicado', '==', publicado)).valueChanges({ idField: 'id' });
        this.lugares$.next(this.todosLosLugares.filter(lugar => lugar.publicado == publicado));
    }

    /** OK: Filtra por el estado de publicacion y por el departamento, luego 
     * actualiza el Subject  lugares$
      */
    getLugaresPublicadoYDepartamento(publicado: boolean, departamento: string): void {
        //si uso la consulta a firestore retorna un observable
        /*return this.afs.collection('lugares', ref => ref.where('publicado', '==', publicado)
        .where('departamento','==',departamento)).valueChanges({ idField: 'id' });
        */
        this.lugares$.next(this.todosLosLugares.filter(lugar => {
            if (lugar.publicado === publicado && lugar.departamento === departamento) {
                return true;
            } else {
                return false;
            }
        })
        );
    }

    //Falta hacer este metodo funcione, tiene que devolver un observable con un array de lugares que coinsidan con el termino de busqueda
    getSugerencias(termino: string): Observable<any> {
        return from(
            this.afs.doc(`lugares`).snapshotChanges()
        );
    }

    /** Elimina correctamente el lugar */
    deleteLugar(id: string) {
        this.lugaresCollection.doc(id).delete().then(res => {
            this.todosLosLugares = this.todosLosLugares.filter(lugar => {
                return lugar.id !== id
            });
            this.getLugaresLocal();
            console.log("Lugar eliminado correntamente")
        }).catch(err => {
            console.error("Se produjo un error al intentar eliminar un el lugar " + id + ". Error:" + err)
        })
    }

    cargarLugares(): void {

        const datos = [{
            "nombre": "Finca Piedra",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "Mal Abrigo",
            "auto": true,
            "bicicleta": false,
            "caminar": false,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p>Una exclusiva estancia eco-turística, donde las 20 hectáreas de selectos viñedos son su mayor encanto. Con sus 1000 hectáreas sobre las sierras de Mahoma, Finca Piedra revela la auténtica vida de campo uruguayo, con el refinado gusto Europeo. Español, inglés y francés son lenguas que dominan sus anfitriones.<p/> <p>Situada en el departamento de San José, a sólo 125 Km de Montevideo y a 110 Km de Colonia. Su favorable ubicación permite llegar desde Buenos Aires en apenas 2 horas y media.<p/> <p>La Estancia abre su tranquera para quienes busquen paz, descanso, experiencias nuevas y aventura.<p/> <p>Nuestros paquetes incluyen numerosas actividades guiadas o libres, sabrosas comidas caseras las cuales se pueden acompañar de deliciosos vinos finos que nacen de viñedos de origen francés con elaboración en bodega propia.<p/>",
            "imagenHome": {
                "name": "fincapiedra",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Ffincapiedra.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "fincapiedra-01",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Ffincapiedra-01.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.9549075,
                "lat": -34.1374848
            },
            "tipo": "Rural",
            "imagenes": [{
                "name": "fincapiedra-01",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Ffincapiedra-01.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "fincapiedra-02",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Ffincapiedra-02.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "fincapiedra-03",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Ffincapiedra-03.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "fincapiedra-04",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Ffincapiedra-04.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "fincapiedra-05",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Ffincapiedra-05.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "fincapiedra-06",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Ffincapiedra-06.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "fincapiedra-07",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Ffincapiedra-07.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "fincapiedra-08",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Ffincapiedra-08.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "fincapiedra-09",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Ffincapiedra-09.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "fincapiedra-10",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Ffincapiedra-10.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "https://www.facebook.com/FincaPiedra",
            "instagram": "https://www.instagram.com/fincapiedra/",
            "web": "http://www.fincapiedra.com/",
            "whatsapp": "https://api.whatsapp.com/send?phone=59892860054",
            "telefonos": [],
            "valoraciones": [],
            "videos": []
        }, {
            "nombre": "Mal Abrigo",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "Mal Abrigo",
            "auto": true,
            "bicicleta": false,
            "caminar": false,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p>En el año 2015, Mal Abrigo es seleccionado por el Ministerio de Turismo para el Premio Pueblo Turístico, el cual apunta al desarrollo local.</p> <p>El Premio apuntó a la restauración de la estación de AFE, y también incluir a los emprendimientos de la zona que ya funcionaban, como el parador “El Galpón”, “Finca Piedra” y Posada Sierras de Mahoma.</p> <p>En el Parque Ferroviario de Mal Abrigo funciona una cafetería, en lo que es el edificio de la estación de trenes, y funcionan casillas de artesanos locales, en donde encontramos productos como tejidos de lana, que son trabajos hechos a partir de lana virgen, con la cual la artesana la hila, peina, lava, tiñe (especialmente con tinturas naturales) y crea infinidad de prendas. También tenemos trabajos de cuchillería artesanal. Y las artistas de la cerámica, con diversidad de modelos y diseños, todos hechos con mucho entusiasmo y amor. Y tenemos quesos de cabra, oveja y vaca y la mezcla de 3 leches, de un establecimiento familiar que se ubica a 15 km de Mal Abrigo.</p> <p>En la cafetería, que es un lugar muy acogedor para tomarnos un café, compartir una larga charla y claro que ver el espectacular atardecer, cuando el sol se esconde por detrás de los cerros, y el cielo se torna de varios tonos, rojizos y azules, nos invitan a quedarnos, apreciando esa magia, en este lugar tan tranquilo, que lo atraviesa la ruta 23, pero que en la vieja estación parece que todo ese bullicio queda atrás. Tal vez sea el lugar, tan importante para este pueblo, que fue creciendo  alrededor de esta estación de trenes, en este pequeño - gran país, allá a principio del siglo XX.  Es todo eso, que nos atrapa cuando pisamos esta estación, tan fundamental para el desarrollo de Mal Abrigo y tan llena de recuerdos. Los turistas que nos visitan quedan impresionados con el trabajo y mantenimiento de este lugar.</p> <p>El Premio que apunta al desarrollo local, va dando sus frutos en el año 2018, se realiza en Mal Abrigo,  la Fiesta del Chocolate Normando. La raza Normando, es la principal en nuestra zona, por un tema de rusticidad de la misma, ya que esta zona es de sierras  y greda, con suelos muy superficiales. La raza normando es de doble propósito, hay establecimientos que producen carne y hay establecimientos lecheros, también queserías artesanales en donde predomina el normando en el tambo. Volviendo a la fiesta del chocolate, sabemos ya del impacto que tuvo en el pueblo y en la región. Para este año que corre se está organizando la segunda edición.</p>  <p>Otro interés turístico en el pueblo es la “Huella de los Murales”, por el momento se pintaron siete murales, en puntos estratégicos para que la gente conozca más de Mal Abrigo; 2 de estos se ubican en el Parque Ferroviario, otro lo encontramos en la esquina de la ruta y la calle Aparicio Saravia y otro enfrente, otra pintura la encontramos en el galpón de futbol de Mal Abrigo y otro mural lo encontramos dentro del barrio de MEVIR a unas 3 cuadras de la ruta. Todos los artistas son regionales.</p> <p>Mal Abrigo tiene un encanto particular, es un paraíso escondido. Que bien supo plasmar en su “Romance a Mal Abrigo” el gran poeta gaucho Wenceslao Varela.</p> <p>Para quienes no nacimos acá, ni en San José, que venimos de Montevideo, Mal Abrigo nos enamora, la estación, sus alrededores, las sierras magnificas, el panorama. Qué lindo es este destino.</p>   <p>Los días de atención en el Parque Ferroviario son sábados, domingos y feriados de 11:00 a 19:00. Si hay algún cambio te avisamos. Cualquier duda que tengas no dudes en consultarnos.</p>",
            "imagenHome": {
                "name": "malabrigo",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Fmalabrigo.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "malabrigo-01",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmalabrigo-01.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.952087,
                "lat": -34.147616
            },
            "tipo": "Rural",
            "imagenes": [{
                "name": "malabrigo-01",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmalabrigo-01.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "malabrigo-02",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmalabrigo-02.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "malabrigo-03",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmalabrigo-03.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "malabrigo-04",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmalabrigo-04.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "malabrigo-05",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmalabrigo-05.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "malabrigo-06",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmalabrigo-06.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "malabrigo-07",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmalabrigo-07.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "malabrigo-08",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmalabrigo-08.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "malabrigo-09",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmalabrigo-09.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "malabrigo-10",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmalabrigo-10.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "malabrigo-11",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmalabrigo-11.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "malabrigo-12",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmalabrigo-12.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "malabrigo-13",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmalabrigo-13.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "malabrigo-14",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmalabrigo-14.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "https://m.facebook.com/MalAbrigoPPT/",
            "instagram": "",
            "web": "",
            "whatsapp": "https://api.whatsapp.com/send?phone=59894479401",
            "telefonos": [],
            "valoraciones": [],
            "videos": []
        }, {
            "nombre": "Barras de Mahoma",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "Mal Abrigo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p>Un lugar para vivir en armonía con una naturaleza que te invita a producir y soñar.</p>  <p>Ubicados en Uruguay, en las Sierras de Mahoma en el departamento de San José y a 120 kilómetros de la capital del país, Montevideo,  se encuentra ubicado el Establecimiento Barras de Mahoma. Un campo familiar dedicado a la ganadería, agricultura, vitivinicultura y forestación. La historia del Establecimiento Barras de Mahoma (EBM) se remonta al año 1996, cuando Silvina Delafond y Mario Rappa se casan y deciden irse a vivir al establecimiento agrícola-ganadero  que ya poseían por la zona de Sierra de Mahoma, en búsqueda de tranquilidad.</p>   <p>Por 2001 deciden \"romper con la rutina\" y tomar el riesgo de incursionar en un rubro en el que no lo habían hecho antes. Así fue como se hizo realidad la plantación de poco más de 4 hectáreas de Cabernet Sauvignon en dos porta injertos distintos.</p>   <p>Las condiciones de la Sierra de Mahoma son espectaculares y únicas en el país, se trata de suelos cascajosos conformados en cantidad elevada de la conocida piedra laja en forma vertical,  y a pocos metros debajo de ésta, un suelo de granito meteorizado y degradado.</p>    <p>Hacia el año 2003 sumaron 2 hectáreas de Tannat y otras tantas de Cabernet Franc. Según Mario, ésta fue la primera etapa del emprendimiento que, tímidamente, iba tomando forma.</p>   <p>Un segundo momento importante ocurrió en 2008. Fue un año de fuerte sequía en nuestro país y Mahoma se vio notoriamente afectada, ya que factores como el exceso de piedra y la falta de materia orgánica en el suelo,  junto a la sequía, se potenciaron, al punto de arruinar las dos cosechas posteriores por la magnitud del perjuicio sobre la vid.</p>   <p>Este fenómeno obligó a la creación de un lago artificial como reserva hídrica para aplicar riego sobre la viña y a partir de 2009, dependiendo las condiciones climáticas, el mismo es activado en noviembre hasta,  como máximo, el 31 de diciembre. En 2015 comenzó la tercera etapa del proyecto, que fue la de la elaboración de vinos. En parte por la impronta de querer hacer algo propio, pero también empujados por el bajo precio de venta de la uva -que hasta ese momento comercializaban sin elaborar- y que por entonces no estaba siendo redituable.</p>   <p>Esa primera etiqueta fue el Corral de la Sierra Cabernet Sauvignon 2015, al que le siguieron un varietal de Cabernet Franc y un corte de sus tres tintas (Cabernet Sauvignon, Cabernet Franc, Tannat). En el proyecto nunca estuvo la idea de construir una bodega y vinificar in situ, debido a los altos costos que eso significa para tan pocos viñedos, por lo que los vinos se elaboran en la bodega Spinoglio.</p>   <p>Al día de hoy, el proyecto -que simbólicamente está cumpliendo 18 años- decidió dar un paso más y establecerse con nuevos vinos, definiendo líneas específicas de consumo y con un objetivo claro, movimiento que también viene acompañado por un cambio drástico de etiquetas. La principal línea es, y continuará siendo, Corral de la Sierra, la que está compuesta por varietales sin ningún tipo de crianza en barricas para permitir que el \"suelo de Mahoma hable por si mismo\". Son un Tannat, un Cabernet Sauvignon y un Cabernet Franc, a los que se le suma un White Blend (un seductor ensamble de distintas elaboraciones de Sauvignon Blanc) y un espumoso base de champagne. Estos dos últimos, vale aclarar, no son elaborados con uvas propias, ya que el establecimiento no posee cultivo de variedades blancas.</p>   <p>El nombre \"corral\" que lleva esta línea hace referencia a una manga de piedra antiquísima que existe en el campo del establecimiento, algo destruida cuando fue adquirido, pero restaurada lentamente hasta el punto de que además de ser el símbolo del proyecto, está siendo utilizada nuevamente para el ganado.</p>   <p>La etiqueta de esta línea tiene la peculiaridad de que en su borde izquierdo posee una guarda de piedras dibujada haciendo referencia justamente al \"corral\", y en cada varietal cambia su color para que sea fácilmente identificable.</p >  <p>Otra línea es una Single Vineyard, de la cual saldrá próximamente al mercado su Cabernet Franc, con una crianza aproximada de seis meses en roble francés.</p>  <p>Y, para coronar el portfolio, elaboran un vino insignia cuyo objetivo es -más que respetar o mostrar el terroir- representar el espíritu del emprendimiento y buscar el gusto y el estilo de sus propietarios. Amadeus -tal su nombre- es un corte compuesto en partes iguales de sus tres variedades tintas, con una cuidadosa crianza de unos 15 meses en roble francés, buscando dejar marca en el tiempo, que, por lo que hemos probado junto a otros sommelieres, dará mucho que hablar en unos años.</p>",
            "imagenHome": {
                "name": "BarraMahoma-3",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2FBarraMahoma-3.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "barrademahoma-03",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbarrademahoma-03.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.88552,
                "lat": -34.060117
            },
            "tipo": "Rural",
            "imagenes": [{
                "name": "barrademahoma-01",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbarrademahoma-01.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "barrademahoma-02",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbarrademahoma-02.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "barrademahoma-03",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbarrademahoma-03.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "barrademahoma-05",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbarrademahoma-05.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "barrademahoma-06",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbarrademahoma-06.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "barrademahoma-07",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbarrademahoma-07.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "barrademahoma-08",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbarrademahoma-08.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "barrademahoma-09",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbarrademahoma-09.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "barrademahoma-10",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbarrademahoma-10.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "barrademahoma-11",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbarrademahoma-11.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "barrademahoma-12",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbarrademahoma-12.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "barrademahoma-13",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbarrademahoma-13.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "barrademahoma-14",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbarrademahoma-14.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "barrademahoma-15",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbarrademahoma-15.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "barrademahoma-16",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbarrademahoma-16.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "https://www.facebook.com/barrasdemahoma/",
            "instagram": "https://instagram.com/vinos_barras_de_mahoma?igshid=nlzfua3r2qsr",
            "web": "http://barrasdemahoma.com.uy",
            "whatsapp": "https://api.whatsapp.com/send?phone=59899340481",
            "telefonos": [],
            "valoraciones": [],
            "videos": []
        }, {
            "nombre": "Museo San José",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p><b>DATOS:</b> Construido en la primera década del S XIX. Fue declarado monumento histórico el 21 de noviembre de 1989. Se convierte en sede del Museo San José en el año 1947. Fue expropiada por el Estado en 1952.</p> <p><b>LA HISTORIA:</b> Se trata de una de las construcciones más representativas de la época colonial que se conserva en San José de Mayo. Fue propiedad de Don Santiago Ortuño, hombre ligado por lazos familiares a los antiguos pobladores y según la tradición oral el Capitán Manuel Artigas ocupó la casa en abril de 1811 para dirigir desde su mirador algunas de las tropas que libraron la Batalla de San José, el primer enfrentamiento de las fuerzas revolucionarias con el ejército españolista que tuviera lugar el 25 de ese mes.</p> <p>Desde fines de S XIX hasta la década del 40 del siglo pasado, la casona perteneció al Agrimensor Manuel D. Rodríguez, revolucionario del Partido Nacional que fue nombrado Jefe Político de San José en 1898 tras haber participado de las luchas de Quebracho en 1886 contra el gobierno de Máximo Santos y la de 1897 contra el de Juan Idiarte Borda que fuera liderada por Aparicio Saravia, a quien seguiría en la última guerra civil que se vivió en Uruguay en 1904.</p> <p><b>EL MUSEO:</b> El Museo San José es una institución privada donde se realizan diversas actividades a nivel formativo y de promoción de la cultura. En él funcionan talleres de diferentes expresiones artísticas, se realizan charlas, exposiciones, cursos, disponiendo de una amplia biblioteca y una espectacular pinacoteca de artistas locales y nacionales.</p>",
            "imagenHome": {
                "name": "museo",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Fmuseo.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "museo-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmuseo-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.714387,
                "lat": -34.337911
            },
            "tipo": "Urbano",
            "imagenes": [{
                "nombre": "museo-1",
                "name": "museo-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmuseo-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "nombre": "museo-2",
                "name": "museo-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmuseo-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "nombre": "museo-3",
                "name": "museo-3",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmuseo-3.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "nombre": "museo-4",
                "name": "museo-4",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmuseo-4.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "nombre": "museo-5",
                "name": "museo-5",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmuseo-5.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "nombre": "museo-6",
                "name": "museo-6",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmuseo-6.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "nombre": "museo-7",
                "name": "museo-7",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmuseo-7.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "https://www.facebook.com/museodepartamentaldesanjose/",
            "instagram": "https://instagram.com/museosanjose?igshid=1jc5iftzor1xj",
            "web": "https://www.sanjose.gub.uy/departamento/turismo/museo-san-jose/",
            "whatsapp": "",
            "telefonos": [
                { "numero": "43423672" }
            ],
            "valoraciones": [],
            "videos": []
        }, {
            "nombre": "Parque Rodó",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p><b>DATOS:</b> Inaugurado el 25 de agosto de 1903 con el nombre de «Parque Mario» por iniciativa del doctor italiano Francisco Giampietro haciendo honor a su hermano sacerdote.</p> <p>Fue reinaugurado el 1 de marzo de 1915, luego de haber pasado a manos del Gobierno Departamental, con el nombre «Parque 18 de Julio», recibiendo la actual denominación en el año 1917.</p> <p><b>LA HOSTERÍA:</b> El 30 de diciembre de 1938 se inauguró la obra del arquitecto Juan Sensso, quien años antes había realizado el Estadio Centenario de Montevideo, siendo en principio un hotel. Recién en el año 1945 comenzaron a funcionar en el edificio los servicios de bar y comedor y en el 1948 se iniciaron las primeras obras de ampliación.</p>  <p>La última ampliación y renovación de estructuras se realizó entre 2014 y 2015, funcionando como hotel, restaurante, salón de eventos y spa.</p>  <p><b>EL PARQUE: </b> 370 árboles autóctonos se pueden apreciar en el recorrido interno por el Parque Rodó, cada uno de ellos con información y descripción.</p>  <p>Un lago con carpas y aves, área de juegos para niños, circuito aeróbico, canchas de fútbol, básquetbol, tenis, pádel, beach volley, y una piscina abierta a todo público donde se dictan clases de natación y se cuenta con servicio de salvavidas, son algunas de las actividades que se pueden realizar en el paseo más popular de los maragatos.</p>  <p><b>EL KARTÓDROMO:</b> El 27 de marzo de 1966 se inauguró el primer kartódromo, donde actualmente se ha instalado una pista de patín. El trasladado dentro del propio Parque Rodó y la reconversión del mismo lo han convertido en uno de los circuitos más importantes a nivel continental, siendo San José la capital de karting del Mercosur.</p>  <p>Denominado «Luis Pedro Serra» en honor al campeón josefino de este deporte, el kartódromo maragato encierra innumerables anécdotas y ha visto pasar por su pista a competidores de la talla de Ayrton Senna.</p> <p><b>PISCINA:</b> Clases de natación y actividades abiertas al público en temporada de verano.</p> <p>https://www.sanjose.gub.uy/departamento/turismo/parque-rodo/</p>",
            "imagenHome": {
                "name": "parque",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Fparque.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "parque-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fparque-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.730451,
                "lat": -34.331115
            },
            "tipo": "Urbano",
            "imagenes": [{
                "name": "parque-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fparque-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "parque-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fparque-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "parque-3",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fparque-3.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "parque-4",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fparque-4.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "parque-5",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fparque-5.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "parque-6",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fparque-6.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "parque-7",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fparque-7.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "parque-8",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fparque-8.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "parque-9",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fparque-9.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "parque-10",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fparque-10.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "parque-11",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fparque-11.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "parque-12",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fparque-12.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "parque-13",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fparque-13.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "parque-14",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fparque-14.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "parque-15",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fparque-15.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "",
            "instagram": "",
            "web": "https://www.sanjose.gub.uy/departamento/turismo/parque-rodo/",
            "whatsapp": "",
            "telefonos": [],
            "valoraciones": [],
            "videos": []
        }, {
            "nombre": "Basílica Catedral",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p><b>DATOS: </b> Bendecida el 24 de marzo de 1875. La obra se inició en el año 1857 y finalizó en 1874. Fue declarada monumento histórico el 24 de octubre de 1990. Longitud desde la escalinata al atrio – 72m Ancho 26m. Con la creación de la Diócesis de San José de Mayo en el año 1955 el templo pasó a ser sede catedralicia. Mons. Luis Baccino fue el primer obispo, el 8 de abril de 1956. Recibió la designación de “Basílica Menor” el 24 de abril de 1957 y la Conferencia Episcopal del Uruguay la delcaró “Santuario Nacional de San José” el 3 de setiembre del mismo año</p>  <p><b>LA HISTORIA: </b> Al fundarse la Villa de San Josef en el año 1783, una humilde construcción de techo de paja sirvió como lugar de culto de la naciente comunidad. Comenzando el SIXI se bendijo el segundo templo, ubicado contiguo al actual, el cual fue prontamente elevado a la categoría de parroquia, dependiente del obispado de Bueno Aires.</p> <p>La proyección y dirección del actual templo es obra del maestro constructor catalán Antonio Fongivell, un hombre con una importante trayectoria en nuestro país, quien también realizó la planta baja de la sede central del Gobierno Departamental.</p> <p><b>EL EDIFICIO: </b> De estructura basilical, la nave central descansa sobre 8 columnas de mármol macizo de Carrara. La ornamentación del templo fue realizada por artistas de primer nivel. El altar mayor y los altorrelieves pertenecen al escultor catalán Domingo Mora. El altar de la Capilla del Santísimo Sacramento es obra del los Hnos. Repetto (Lavagno – Italia). El tallado de las puertas de entrada fueron realizados por José Villar. Los frescos de las paredes y la “Gloria de San José” de la cúpula son del pintor italiano Lino Dinetto.</p> <p><b>EL RELOJ: </b> El esfuerzo del pueblo maragato y del párroco Pbro. Norberto Bentancur, hicieron posible que el templo contara con un reloj de procedencia suiza que desde el 25 de agosto de 1900 marca el ritmo de vida de la ciudad, indicando la hora con el sonido de una campana de más de tres toneladas que emite un sonido que puede escucharse a 15 kilómetros de distancia.</p>        <p><b>La nueva cúpula de San José: </b> Ante un riesgo estructural la catedral maragata debió retirar azulejos centenarios. Desde el año 1875 estuvieron en la cúpula mayor de la Basílica Catedral de San José de Mayo. Son los azulejos Pas de Calais, un ejemplo del arte francés del siglo XIX. Debieron ser retirados y la Iglesia resolvió ponerlos a la venta para financiar obras.</p>",
            "imagenHome": {
                "name": "Catedral",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2FCatedral.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "Catedral-01",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FCatedral-01.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.713478,
                "lat": -34.340111
            },
            "tipo": "Urbano",
            "imagenes": [{
                "name": "Catedral-01",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FCatedral-01.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "Catedral-02",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FCatedral-02.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "Catedral-03",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FCatedral-03.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "Catedral-04",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FCatedral-04.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "Catedral-05",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FCatedral-05.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "Catedral-06",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FCatedral-06.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "Catedral-07",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FCatedral-07.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "Catedral-08",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FCatedral-08.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "Catedral-10",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FCatedral-10.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "Catedral-11",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FCatedral-11.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "",
            "instagram": "",
            "web": "https://www.sanjose.gub.uy/departamento/turismo/basilica-catedral/",
            "whatsapp": "",
            "telefonos": [],
            "valoraciones": [],
            "videos": []
        }, {
            "nombre": "Club San José",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p>El proyecto de Aroztegui es elogiado por la acertada conexión entre los ambientes y por dar una respuesta donde “existe claridad, orden y proporción”.</p> <p>El club se ubica sobre la plaza principal de San José, lugar histórico que concentra el poder político y religioso e importantes edificios culturales como el Teatro Macció. También el Club San José, por su escala, sus características espaciales y su calidad material, forma parte de un ambicioso proyecto social y cultural. Cabe observar el contenido y el tono de la nota publicada en el diario El Día unas semanas antes de su inauguración: Muchos podrán preguntarse el por qué de esta obra, la cual, como veremos, ha costado tanto. La explicación la encontramos en la inquietud de esas personan directivas del San José, que compenetradas de la necesidad de brindarle a su ciudad un club social de acuerdo a los progresos edilicios que se vienen anotando, se abocaron de lleno a la tarea, sin reparar en lo enorme del trabajo, pensando que con eso estaban aportando en forma importantísima al vivir social maragato y a la intensificación cultural que se está esbozando en el ambiente local en los últimos tiempos.</p>  <p>Por eso también la obra es grande: por su contenido más espiritual que materialista ya que la imponencia del edificio no alcanza a ocultar la terminante importancia que tiene el mismo para el desarrollo de la cultura. El Club San José es, junto a la sucursal 19 de Junio del Banco República, la máxima expresión de la concepción espacial de Aroztegui con un partido arquitectónico fundamentado en la sección del edificio y las conexiones entre los distintos niveles. La estructura, asimismo, consta básicamente de una retícula de pilares que funciona independientemente de las separaciones y articulaciones, puntuando y regulando el espacio. Retoma en este sentido la propuesta hecha para el edificio Sede del Club Nacional de Football, haciendo suyos algunos presupuestos del International Style.</p> <p>Sobre la calle 25 de Mayo, el volumen se retira de la línea de edificación y da lugar a amplias terrazas que en planta baja enmarcan el acceso principal y funcionan como extensión del bar, animando así la vida de la plaza. Además del bar, la planta baja cuenta con una salade billares y juegos situada medio nivel por debajo y volcada hacia la calle Batlle y Ordóñez. La escalera ubicada contra la medianera Sur está rodeada de paredes de mármol y una franja de vidrio que continúa en el cielorraso, todo ello con un despiezo que recuerda obras de Le Corbusier y Giuseppe Terragni.</p> <p>Por la escalera se accede a un entrepiso que funciona para grandes eventos (bailes, etcétera) y en este mismo entrepiso, pero en el lado opuesto, otra escalera da acceso a un nivel superior. De esta manera, Aroztegui plantea aquí su propia versión de la promenade architecturale (paseo arquitectónico) corbusieriana. </p>",
            "imagenHome": {
                "name": "club-san-jose",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Fclub-san-jose.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "club-san-jose-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fclub-san-jose-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.713063,
                "lat": -34.339446
            },
            "tipo": "Urbano",
            "imagenes": [{
                "name": "club-san-jose-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fclub-san-jose-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "club-san-jose-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fclub-san-jose-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "club-san-jose-5",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fclub-san-jose-5.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "club-san-jose-6",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fclub-san-jose-6.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "club-san-jose-7",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fclub-san-jose-7.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "club-san-jose-8",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fclub-san-jose-8.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "club-san-jose-9",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fclub-san-jose-9.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "https://www.facebook.com/CantinadelClubSanJose/?ti=as",
            "instagram": "",
            "web": "",
            "whatsapp": "",
            "telefonos": [
                {
                    "numero": "43426344"
                }
            ],
            "valoraciones": [],
            "videos": []
        }, {
            "nombre": "AFE / ECIE",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p>La Industria Ferroviaria en el Uruguay surgió con capitales nacionales en el año 1866 en que se funda la sociedad anónima “Ferrocarril Central del Uruguay”.</p> <p>Otorgada la concesión comienzan rápidamente las obras y el 1º de enero de 1869 se inaugura el tramo de 17 km. de extensión entre estación Bella Vista en el departamento de Montevideo y estación Las Piedras en el departamento de Canelones.</p> <p><b>Las estaciones: </b> Los edificios de estación construidos en nuestro país presentan variaciones, predominando en ellos la generación lineal impuesta por el tendido de las vías y la forma de acceso a los vagones.</p> <p>Los primeros edificios fueron modestas casillas prefabricadas de chapa y madera, sustituidas en su mayoría por construcciones más sólidas realizadas en ladrillo o piedra, techo plano de azotea o cubiertas inclinadas de tejas, pizarra o chapas onduladas de zinc o fibrocemento, de volúmenes netos y definidos o con rejas y balcones de hierro forjado y remates de maderas caladas.</p> <p>Los edificios tradicionales incorporan la vivienda del jefe y alojamiento del telegrafista conformando una unidad formal y funcional con el local de estación.</p> <p><b>Ecie (Espacio Cultural Ignacio Espino): </b> Durante 10 años el Antiguo Galpón de Cargas de AFE de San José fue un espacio destruido producto del abandono y hoy el edificio cuenta con salones, sala de ensayos, sala de reuniones, taller, administración, sala de espectáculos con una capacidad para 70 personas y más de un centenar de personas que hacen uso semanalmente de esas instalaciones</p> <p>El Espacio Cultural Ignacio Espino (ECIE) nace bajo el objetivo de rescatar, a través de un proyecto artístico, social, cultural y educativo, la histórica edificación del Antiguo Galpón de Cargas de AFE (San José - Uruguay), patrimonio arquitectónico industrial de los maragatos y legado de los ingleses. El ECIE está administrado y gestionado por Intermedios producciones.</p> <p><b>¿Qué es Intermedios producciones?</b> Primera productora de la ciudad de San José (Uruguay) abocada a la producción artística profesional. Nace el 25 de junio del año 2005 y se funda como asociación civil el 11 de abril del año 2011. Uno de sus fines es la administración y gestión del Espacio Cultural Ignacio Espino (ECIE) en la ciudad de San José de Mayo, espacio donde también se encuentra su sede.</p>  <p><b>¿Por qué Ignacio Espino?</b> Homenaje en vida a Ignacio “Nacho” Espino por incentivar en el departamento de San José no solo el teatro sino también la cultura general del medio. Luchador y soñador, homenajearlo a él es también homenajear a nuestro equipo.</p>  <p><b>Área de Formación Artística del ECIE: </b> La enseñanza artística en el plano educativo no-formal es una de las prioridades del ECIE, apostando a docentes de reconocida trayectoria y con altos niveles de capacitación. El Área de Formación Artística está compuesta por: Área Artes Escénicas, Área Música, Área Artes Visuales y Área Salud.</p>",
            "imagenHome": {
                "name": "afe",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Fafe.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "afe-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fafe-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.712949,
                "lat": -34.332485
            },
            "tipo": "Urbano",
            "imagenes": [{
                "name": "afe-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fafe-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "afe-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fafe-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "afe-3",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fafe-3.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "afe-4",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fafe-4.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "afe-5",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fafe-5.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "afe-6",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fafe-6.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "afe-7",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fafe-7.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "afe-8",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fafe-8.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "https://www.facebook.com/ecie.oficial/",
            "instagram": "https://instagram.com/ecie_oficial_?igshid=ci707d86amff",
            "web": "http://www.ecie.com.uy/",
            "whatsapp": "https://api.whatsapp.com/send?phone=59898779524",
            "telefonos": [
                {
                    "numero": "43434659"
                }

            ],
            "valoraciones": [],
            "videos": []
        }, {
            "nombre": "Picada Varela",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p>Uno de los bellos lugares con el que cuenta San José es la Picada de Varela.</p>  <p>Se trata de un sitio ubicado a unos dos kilómetros de la ciudad, que cuenta con una imponente naturaleza, y que por ello mismo, dispone de muchas opciones de disfrute. </p>  <p>De esa forma entonces, podemos ver en la zona, las aguas del Río San José. Cuenta con una atrayente vegetación que crece en los costados, dando como resultado, una flora y fauna muy diversa. </p>  <p><b>Actividades en la Picada de Varela: </b> Las actividades que pueden realizarse ahí, son muy variadas, aunque en general, tienen como eje principal el aprovechamiento de todo el ecosistema en el que se halla. </p>  <p>Es muy factible poder nadar, pescar, dar paseos en bote o practicar algunos juegos o deportes náuticos. </p>  <p>Cuenta con muchos servicios para los visitantes como: parador, servicios higiénicos, piscina para niños, espacios para practicar deportes, entre varios otros. </p>  <p>Como era de esperar, la Picada de Varela recibe en su territorio muchas otras actividades que pueden hacer de ella un recorrido aún más interesante. </p>  <p>También es un escenario frecuente para los campeonatos de moutain bike, excursiones y otras. </p>  <p>Si quieres disfrutar de un lugar tranquilo y con muchas opciones, tienes que visitar la Picada de Varela. La encontrarás en la Ruta 3 km. 95. </p>",
            "imagenHome": {
                "name": "picada-varela",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Fpicada-varela.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "picada-varela-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fpicada-varela-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.708497,
                "lat": -34.318513
            },
            "tipo": "Urbano",
            "imagenes": [{
                "name": "picada-varela-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fpicada-varela-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "picada-varela-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fpicada-varela-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "picada-varela-3",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fpicada-varela-3.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "picada-varela-4",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fpicada-varela-4.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "picada-varela-5",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fpicada-varela-5.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "picada-varela-6",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fpicada-varela-6.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "",
            "instagram": "",
            "web": "https://www.sanjose.gub.uy/departamento/turismo/picada-varela/",
            "whatsapp": "",
            "telefonos": [],
            "valoraciones": [],
            "videos": []
        }, {
            "nombre": "Casa Dominga",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p>Somos una institución que busca promover la cultura en el sentido más amplio. Desde cursos y talleres, con galerías para exposiciones, ofrecemos a la comunidad la posibilidad de desarrollar y potenciar su creatividad. Además, contamos con un centro de cowork con máxima velocidad de wifi, para que el trabajo colaborativo apuntale los proyectos individuales. </p> <p>Dentro de nuestro rol en la comunidad <b>centralizamos la información turística</b> y novedades del departamento para hacerles más fácil a los visitantes su estadía. Brindamos amplia folletería, <b>mapas, asesoramiento, alquiler de bicicletas, picnic day, entre otros. </b> </p> <p>Para que el disfrute y la utilidad sean lo más apropiado, contamos con diferentes espacios adaptados a las diferentes necesidades de cada persona y evento: sala de reuniones estudio fotográfico, taller de plástica, biblioteca, hermosos patios interiores, además de contar con un excelente servicio de cafetería. </p>",
            "imagenHome": {
                "name": "casadominga",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Fcasadominga.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "casadominga-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fcasadominga-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.7145,
                "lat": -34.340007
            },
            "tipo": "Urbano",
            "imagenes": [{
                "name": "casadominga",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fcasadominga.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "casadominga-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fcasadominga-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "casadominga-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fcasadominga-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "casadominga-3",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fcasadominga-3.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "casadominga-4",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fcasadominga-4.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "casadominga-5",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fcasadominga-5.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "casadominga-6",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fcasadominga-6.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "casadominga-7",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fcasadominga-7.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "casadominga-8",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fcasadominga-8.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "casadominga-9",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fcasadominga-9.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "https://www.facebook.com/casadomingasj/",
            "instagram": "https://instagram.com/casa.dominga?igshid=1uosny2672rbg",
            "web": "https://casadominga.com.uy/",
            "whatsapp": "https://api.whatsapp.com/send?phone=59899468473",
            "telefonos": [],
            "valoraciones": [{
                "usuario": "0WuWuehqBFTNHWgBAxBNU8fwWHO2",
                "valor": 5
            }, {
                "usuario": "AzeQYy3G3RSJsu5Kkw2BCOeBG1H2",
                "valor": 5
            }, {
                "usuario": "E081kqIkdyQ8u5BZiTog8svp5sa2",
                "valor": 5
            }, {
                "usuario": "FAL5lpaBcFhGh8HbHFXmYNTswsC3",
                "valor": 2
            }, {
                "usuario": "HRSnd2YPgOMl2jvTgpACpLl7nTA2",
                "valor": 5
            }, {
                "usuario": "YMr21A5APyPbjWcKJgKP6NF7gi32",
                "valor": 4
            }],
            "videos": []
        }, {
            "nombre": "Capilla del Huerto",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p><b>DATOS: </b> Se inauguró en el año 1895. Fue declarada monumento histórico el 27 de diciembre de 1996. Comenzó a construirse en el año 1892.</p>  <p><b>LA HISTORIA: </b> En el año 1876, durante el gobierno del Coronel Latorre, el Jefe Político de San José, Héctor Soto, mandó construir un templo en honor a su suegra, Joaquina Fernández de Martínez, una mujer muy religiosa que había muerto de forma inesperada en nuestra ciudad.</p>  <p>Tiempo después, Soto y su esposa, Joaquina Martínez Fernández, se radican en Buenos Aires.</p>  <p>Cuando las obras de la capilla comienzan a realizarse se produce el fallecimiento de Héctor Soto y es si viuda quien hace llegar una serie de donaciones con el fin de culminar el templo.</p>  <p>El constructor suizo Félix Olgiati, quien ya había realizado obras como el hospital viejo y la casa que actualmente oficia como sede del Centro Comercial e Industrial, estuvo a cargo de las obras.</p>  <p><b>EL EDIFICIO: </b> La capilla es una joya en miniatura del estilo gótico, donde se destacan el púlpito, el altar y los confesionarios del tallador y ebanista Miguel Barredo y los frescos del pintar italiano Lino Dinetto.</p>",
            "imagenHome": {
                "name": "huerto",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Fhuerto.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "huerto-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fhuerto-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.710933,
                "lat": -34.337892
            },
            "tipo": "Urbano",
            "imagenes": [{
                "name": "huerto-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fhuerto-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "huerto-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fhuerto-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "huerto-3",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fhuerto-3.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "huerto-5",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fhuerto-5.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "",
            "instagram": "",
            "web": "https://www.sanjose.gub.uy/departamento/turismo/capilla-nuestra-senora-del-huerto/",
            "whatsapp": "",
            "telefonos": [],
            "valoraciones": [
                { "user": 0 }
            ],
            "videos": []
        }, {
            "nombre": "ICE",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p><b>Instituto Cultural Español (ICE): </b>  El edificio es de 1888, un estilo neoclásico (aunque no sigue al pie de la letra todas sus características); fue construido por los propios integrantes de la Asociación Española 5a(quinta) de Socorros Mutuos. Dicha asociación se fundó por españoles en 1860 con el objetivo de atender la salud de los socios; cubrir medicación y tratamientos médicos.</p> <p>En 1980 se reformaron los Estatutos y se creó el Instituto Cultural Español con objetivos culturales y abandonando los objetivos originales.</p> <p>En mayo de 2005 se retoman las actividades después de muchos años. Estas han continuado creciendo hasta la actualidad; se cuenta con más de 500 socios y aproximadamente 20 talleres.</p> <p>Es una asociación con personería jurídica, sin fines de lucro q se sostiene con el aporte de los socios y diferentes beneficios que pone en marcha la Comisión Directiva y la de Apoyo.</p> <p>Además de fortalecer las manifestaciones culturales en general, se ha trabajado intensamente para mantener el edificio en condiciones para el desarrollo de la vida institucional.</p>",
            "imagenHome": {
                "name": "ola",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Fespa%C3%B1ola.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "ola-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fespa%C3%B1ola-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.712545,
                "lat": -34.341574
            },
            "phone": "43441081",
            "tipo": "Urbano",
            "imagenes": [{
                "name": "espa%C3%B1ola-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fespa%C3%B1ola-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "espa%C3%B1ola-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fespa%C3%B1ola-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "espa%C3%B1ola-3",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fespa%C3%B1ola-3.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "https://www.facebook.com/InstitutoCulturalEspanolSanJose/?ti=as",
            "instagram": "https://instagram.com/icesanjose?igshid=1m6jvf2kus26k",
            "web": "",
            "whatsapp": "",
            "telefonos": [],
            "valoraciones": [
                { "user": 0 }
            ],
            "videos": []
        }, {
            "nombre": "Quinta del Horno",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p><b>DATOS: </b> Construida en las primeras décadas del SXIX. Fue declarada monumento histórico el 20 de marzo de 1990.</p>  <p><b>LA HISTORIA: </b> La casona fue propiedad de Don Francisco Larriera, uno de los descendientes de las familias fundadoras de la Villa de San Josef, quien tuviera una destacada actuación pública en el ámbito local, habiendo sido de los prisioneros patriotas en el combate de San José, donante de las colectas realizadas para solventar los gastos de la guerra contra Brasil y posteriormente ya en el año 1857 Jefe Político y de Policía.</p>  <p>Si bien vivía frente a la plaza principal, Francisco Larriera pasaba temporadas en la Quinta, donde se hacían bailes, fiestas y recepciones importantes que tuvieron una afamada reputación y a la que acudían en diversas ocasiones personalidades de la época vinculadas a su persona como el General Manuel Oribe, Don Luis de Herrera, el General Eugenio Garzón, y Don Cándido Joanicó entre otros.</p>  <p>El nombre “Quinta del Horno” surge debido a la existencia de un horno de ladrillos instalado cerca del arroyo Mallada, que no solamente sirvió para la fabricación de mampostería para las diferencias casas de la familia Larriera, sino que desde allí salieron la mayoría de los ladrillo utilizados en la construcción de la Basílica Catedral.</p>  <p><b>EL EDIFICIO: </b> Si bien ya no existen ni la escalera de piedra que conducía a la azotea, ni los pisos de baldosa roja con figuras geométricas, ni las construcciones para los esclavos, la sobriedad de su estilo nos acerca a la vida de la una familia maragata en el S XIX.</p>  <p><b>Fuente: </b> https://www.sanjose.gub.uy/departamento/turismo/quinta-del-horno/</p>",
            "imagenHome": {
                "name": "quintadelhorno",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Fquintadelhorno.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "quintadelhorno-01",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fquintadelhorno-01.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.716522,
                "lat": -34.329675
            },
            "tipo": "Urbano",
            "imagenes": [{
                "name": "quintadelhorno-01",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fquintadelhorno-01.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "quintadelhorno-02",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fquintadelhorno-02.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "quintadelhorno-03",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fquintadelhorno-03.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "quintadelhorno-04",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fquintadelhorno-04.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "",
            "instagram": "",
            "web": "https://www.sanjose.gub.uy/departamento/turismo/quinta-del-horno/",
            "whatsapp": "",
            "telefonos": [{
                "numero": "43431314"
            }],
            "valoraciones": [
                { "user": 0 }
            ],
            "videos": []
        }, {
            "nombre": "UTEC",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": true,
            "accesibilidad": false,
            "descripcion": "<p><b>Cárcel vieja – UTEC</b></p> <p>La vieja cárcel de San José está ubicada en la intersección de las calles Ciganda -donde está la puerta principal- y Artigas, en pleno centro, a media cuadra de la plaza principal.</p> <p>Hasta hacía poco tiempo, antes de convertirse en un centro educativo, sus gruesas paredes grises, las rejas negras de las ventanas y los portones del ingreso, conformaban una imagen típica que un maragato reconocería en cualquier lugar del mundo.Estuvo operativa hasta el 29 de abril del año 2009.</p> <p><b>Hoy UTEC</b></p> <p>En el nuevo local de más de 1.100 metros cuadrados, con capacidad para 250 estudiantes por turno, se impartirá la carrera de Tecnólogo Informático, oferta conjunta de la Universidad Tecnológica, la UTU y la Universidad de la República. El Ministerio del Interior cedió el predio donde funcionaba la ex cárcel departamental convirtiéndose hoy en un moderno centro educativo con vestigios de su historia, obra que culminó en 2020.</p>",
            "imagenHome": {
                "name": "utec",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Futec.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "utec-6",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Futec-6.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.714027,
                "lat": -34.341174
            },
            "tipo": "Urbano",
            "imagenes": [{
                "name": "utec-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Futec-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "utec-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Futec-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "utec-3",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Futec-3.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "utec-4",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Futec-4.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "utec-5",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Futec-5.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "utec-6",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Futec-6.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "utec-7",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Futec-7.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "",
            "instagram": "",
            "web": "https://utec.edu.uy/itr-centrosur/un-edificio-con-pasado-y-futuro/",
            "whatsapp": "",
            "valoraciones": [{
                "user": 0
            }],
            "videos": []
        }, {
            "nombre": "Sierra de Mahoma",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "Mal Abrigo",
            "auto": true,
            "bicicleta": false,
            "caminar": false,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p>La Posada Sierra de Mahoma está ubicada en la ruta 23, kilómetro 126, en Mal Abrigo, San José de Mayo en Uruguay.</p> <p><b>Comodidades de la Posada Sierra de Mahoma: </b> Es un hermoso y acogedor lugar que cuenta con apartamentos equipados para 2, 4 y 6 personas. Tienen un ambiente sencillo, cálido y agradable, con TV Cable, estufa a leña, heladera, cocina, vajilla, baño privado, con una alta higiene y seguridad. Los huéspedes pueden preparar sus comidas y realizar asados. </p> <p>Unos de los aspectos más llamativos del lugar es el paisaje natural que aprecian y gozan los huéspedes, quienes deben ir preparados para disfrutar de una gran variedad de ofertas que les permitirán conocer la región y vivir instantes inolvidables.</p> <p><b>Restaurante de la Posada Sierra de Mahoma: </b> En su restaurante posee una amplia oferta gastronómica dentro de la que sobresalen las tortas fritas, pastelitos y pasta frola, típica de la región. En el menú también se encuentran las carnes rojas, las aves, pizza casera, canelones con verdura, pan casero, sándwiches y pan casero.</p> <p>También ofrece el servicio de restaurante y salón de recepciones con capacidad para 70 personas. Existe la opción de camping para los turistas que gustan rodearse de la naturaleza y piscina.</p> <p>La Posada y Restaurante Sierra de Mahoma ofrece el servicio de cabalgatas guiadas y al aire libre. Realiza cada noviembre la famosa misa de peregrinación a la Virgen del Rosario de San Nicolás que tiene su santuario en las Sierras de Mahoma.</p> <p>Hay caminatas para el avistamiento de aves, guía la visita a la playa de las piedras en Sierras de Mahoma, realiza prácticas de senderismo y mountainbike; además cuenta con lugares o espacios para el retiro espiritual de sus visitantes: </p> <ul> <li>Pueblo Turístico Mal Abrigo</li> <li>Estancia Finca Piedra</li> <li>Establecimiento Barra de Mahoma</li> </ul>",
            "imagenHome": {
                "name": "SierraMahoma",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2FSierraMahoma.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "SierraMahoma-01",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FSierraMahoma-01.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.959684,
                "lat": -34.125147
            },
            "tipo": "Rural",
            "imagenes": [{
                "name": "SierraMahoma-01",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FSierraMahoma-01.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "SierraMahoma-02",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FSierraMahoma-02.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "SierraMahoma-03",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FSierraMahoma-03.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "SierraMahoma-04",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FSierraMahoma-04.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "SierraMahoma-05",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FSierraMahoma-05.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "SierraMahoma-06",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FSierraMahoma-06.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "SierraMahoma-07",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FSierraMahoma-07.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "SierraMahoma-08",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FSierraMahoma-08.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "SierraMahoma-09",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FSierraMahoma-09.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "SierraMahoma-10",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2FSierraMahoma-10.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "https://www.facebook.com/sierrasdemahoma.mahoma",
            "instagram": "",
            "web": "",
            "whatsapp": "",
            "telefonos": [],
            "valoraciones": [
                { "user": 0 }
            ],
            "videos": []
        }, {
            "nombre": "Boliche de Campaña",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "Mal Abrigo",
            "auto": true,
            "bicicleta": false,
            "caminar": false,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p>Ingrese al mundo del campo, compartiendo la vida en un boliche de campaña como lo vienen haciendo los paisanos desde  antaño,  sea parte de las costumbres, vivencias y sueños de la gente del campo, compartiendo una picada  en el mostrador de un bar, almacén y club social, con los parroquianos del lugar y sin prisas</p>",
            "imagenHome": {
                "name": "a",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Fbolichedecampa%C3%B1a.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "a-01",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbolichedecampa%C3%B1a-01.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.8823,
                "lat": -34.095801
            },
            "tipo": "Rural",
            "imagenes": [{
                "name": "bolichedecampa%C3%B1a-01",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbolichedecampa%C3%B1a-01.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "bolichedecampa%C3%B1a-02",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbolichedecampa%C3%B1a-02.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "bolichedecampa%C3%B1a-03",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbolichedecampa%C3%B1a-03.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "bolichedecampa%C3%B1a-04",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbolichedecampa%C3%B1a-04.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "bolichedecampa%C3%B1a-05",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fbolichedecampa%C3%B1a-05.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "",
            "instagram": "",
            "web": "",
            "whatsapp": "",
            "telefonos": [{
                "numero": "43401558"
            }],
            "valoraciones": [
                { "user": 0 }
            ],
            "videos": [
                { "url": "https://www.youtube.com/embed/WEn3eSV-hvw" }
            ]
        }, {
            "nombre": "Teatro Maccio",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": true,
            "accesibilidad": false,
            "descripcion": "<p><b>DATOS: </b> <p>Se inaugura el 5 de junio de 1912.</p> <p>Fue declarado monumento histórico el 27 de diciembre de 1984.</p> <p>Su construcción comenzó en el año 1909.</p> <p>Aquí cantó por última vez en el Uruguay “el Mago” Carlos Gardel.</p> <p>Actualmente tiene capacidad para 800 personas.</p></p>  <p><b>LA HISTORIA: </b> En la primera década del Siglo XX la muerte de Don Bartolomé Macció no sólo conmocionó a su familia, sino que la llevó a dirimir de qué forma honrar al hacendado italiano que un día arribó a San José enamorado de nuestra tierra.</p>  <p>La tradición oral cuenta que Rafael Sienra, yerno de Doña Filomena Servetto de Macció, la disuadió de levantar un monumento funerario en homenaje de su extinto esposo, convenciéndola de “perpetuar su memoria entre los vivos y no entre los muertos”.</p>  <p>El propio Sienra escribió y firmó, en la prensa de la época, un documento dirigido al ministro de Hacienda, doctor Blas Vidal, fechado el 23 de julio de 1909 y que años después transcribiera la revista local “Mundo Maragato”. En él se informaba que Doña Filomena y sus hijos “en el deseo de llevar a cabo e inmediata realización una loable iniciativa que en momentos en que la muerte vino a sorprenderlo acariciaba aquel vecino, generoso y progresista, han resuelto, más que como un fin especulativo, como un homenaje a su memoria, construir en esta ciudad un teatro…”</p>  <p>En 1909 la propuesta del constructor Leopoldo Tossi dio comienzo a cargo de José Brusechi y desde el 5 de junio de 1912 cuando ante la presencia de las máximas autoridades políticas, culturales y sociales la orquesta del maestro Luis Sambucetti y las palabras del poeta Juan Zorrilla de San Martín dieran por inaugurado el teatro, la sala ha sido escenario de diversas manifestaciones culturales culturales: teatro, cine e incluso bailes.</p>  <p>Los herederos de la familia Macció vendieron al entonces Banco de San José el edificio en 1959. La concreción de este negocio se debe a que los accionistas, directores y empleados del banco, realizaron aportes desde 1947 a un fondo para la concreción de una importante obra en beneficio de la comunidad. Así fue que en el año de su cincuentenario el Teatro Macción pasó a manos del Gobierno Departamental.</p>  <p>Debido al serio deterioro que presentaba el edificio y por razones de seguridad, el teatro debió cerrar sus puertas en 1965, debiendo esperar 9 años para reabrir sus puertas el 24 de agosto de 1973.</p>  <p>El 13 de febrero de 2010 se realiza una nueva reforma del edificio realizándose una restauración total del teatro adaptándose tanto la funcionalidad como la equipación de la sala a los nuevos tiempos para recibir espectáculos de primer nivel y para cumplir de manera adecuada con una intensa labor cultural no solamente en la sala mayor si no en todas las dependencias del edificio.</p>  <p><b>EL EDIFICIO: </b> Posee una espectacular acústica una magnífica visión del escenario desde todos los puntos y una encantadora belleza en sus instalaciones, destacándose el telón de felpa italiana y la araña de cristal de Murano.</p>  <p><b>ARTISTAS: </b> Innumerables personalidades nacionales e internacionales han pasado por su escenario en los cien años de vida de este teatro. Fue el último lugar en que actuó Carlos Gardel en suelo uruguayo, antes de su trágico final. También contó con la presencia de otras grandes figuras de la cultura, como el poeta nicaragüense Rubén Darío, el tenor José Oxilia, Margarita Xirgú, Carlos Brussa, Víctor Damián, Francisco Canaro, Enrique Santos Discépolo, Tita Merello, Atahualpa Yupanqui, Luis Sandrini y Malvina Pastorino, Ariel Ramírez con la Misa Criolla, Norma Aleandro, Graciela Borges, Rodolfo Bebán, Luis Batlle Ibañes, China Zorrilla, Antonio Gasalla, Pepe Guerra, Larbanois - Carrero, Estela Medina, Gastón Ciarlo presentaciones de Teatro El Galpón, la Comedia Nacional, Ballet y Orquesta Sinfónica del SODRE, Hernán Piquín, Julieta Venegas y tantos otros que en estos años han estado presentes en el Teatro Macció, para cada vez que se levanta el telón, se renueve la magia del espectáculo.</p> <p>Desde el año 2018 en esta sala teatral se llevan a cabo las charlas TEDxSanJosédeMayo, evento anual que es plataforma para que oradores locales cuenten sus ideas, en un máximo de 18 minutos.</p>  <p>https://www.sanjose.gub.uy/</p> <p>://es.wikipedia.org/</p>",
            "imagenHome": {
                "name": "teatro",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Fteatro.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "teatro-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fteatro-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.713489,
                "lat": -34.338889
            },
            "tipo": "Urbano",
            "imagenes": [{
                "name": "teatro-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fteatro-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "teatro-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fteatro-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "teatro-3",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fteatro-3.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "teatro-4",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fteatro-4.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "teatro-5",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fteatro-5.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "teatro-6",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fteatro-6.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "teatro-7",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fteatro-7.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "teatro-8",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fteatro-8.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "teatro-9",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fteatro-9.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "",
            "instagram": "",
            "web": "https://www.sanjose.gub.uy/departamento/turismo/teatro-maccio/",
            "whatsapp": "",
            "telefonos": [{
                "phone": "43422723"
            }],
            "valoraciones": [],
            "videos": []
        }, {
            "nombre": "Intendencia Municipal",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p>Edificio Sede Gobierno Departamental.</p> <p>El edificio donde actualmente funciona la Dirección de Higiene del Gobierno Departamental . Se desconoce el año de construcción y su Arquitecto. Se destaca por su gran tamaño. Previamente funcionó la tienda por departamentos de la firma Cuadrado y Teijeiro. Actualmente se lo conoce como Edificio Marí­n.</p>",
            "imagenHome": {
                "name": "intendencia",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Fintendencia.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "intendencia-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fintendencia-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.713354,
                "lat": -34.341147
            },
            "tipo": "Urbano",
            "imagenes": [{
                "name": "intendencia-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fintendencia-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "intendencia-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fintendencia-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "intendencia-3",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fintendencia-3.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "intendencia-4",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fintendencia-4.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "intendencia-5",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fintendencia-5.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "intendencia-6",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fintendencia-6.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "intendencia-7",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fintendencia-7.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "",
            "instagram": "",
            "web": "https://www.sanjose.gub.uy/",
            "whatsapp": "",
            "telefonos": [{
                "numero": "43429000"
            }],
            "valoraciones": [],
            "videos": []
        }, {
            "nombre": "Mercado Municipal",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": true,
            "accesibilidad": false,
            "descripcion": "<p>Frutas y verduras, flores y plantas, carnes, fiambres, quesos, frutos del mar, tiendas de ropa se pueden encontrar en el Mercado Municipal. Lunes a Viernes atención de 7 a 19 horas. Sábado de 7 a 13 horas.</p>  <p>También las Manos Rurales Maragatas tienen un local en el Mercado Municipal. En Manos Rurales Maragatas trabajan más de 20 mujeres de diferentes zonas del departamento. Elaboran todo tipo de comidas caseras, mermeladas, etc. Productos avalados por el LATU.  En otro sector del mercado se encuentra el Hub de Innovación y Emprendedurismo de San José. Se trata de una propuesta de la Dirección General de Desarrollo que apunta a que los jóvenes de San José puedan, desarrollar ideas innovadoras frente a problemáticas que existan en sus centros de enseñanza y medios locales, y a poner en marcha el HubLab de San José.</p> <p>www.mercadosanjose.uy</p>",
            "imagenHome": {
                "name": "feria",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Fferia.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "feria-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fferia-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.709908,
                "lat": -34.33943
            },
            "tipo": "Urbano",
            "imagenes": [{
                "name": "feria-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fferia-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "feria-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fferia-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "feria-3",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fferia-3.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "",
            "instagram": "",
            "web": "",
            "whatsapp": "",
            "telefonos": [],
            "valoraciones": [],
            "videos": []
        }, {
            "nombre": "Club Madreselvas",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p>Un club de Tenis con dos canchas de polvo de ladrillo de primer nivel, para que puedas practicar este deporte en un entorno natural maravilloso rodeado de la flora nativa de nuestro departamento. En sus encantadoras instalaciones podrás disfrutar del deporte y la naturaleza, junto al Río San José.</p> <p>Facebook Las Madreselvas</p>",
            "imagenHome": {
                "name": "madreselva",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Fmadreselva.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "madreselva-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmadreselva-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.713891,
                "lat": -34.317655
            },
            "tipo": "Urbano",
            "imagenes": [{
                "name": "madreselva-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmadreselva-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "madreselva-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmadreselva-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "madreselva-3",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmadreselva-3.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "madreselva-4",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmadreselva-4.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "madreselva-5",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmadreselva-5.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "madreselva-6",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmadreselva-6.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "madreselva-7",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmadreselva-7.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "madreselva-8",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fmadreselva-8.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "",
            "instagram": "https://instagram.com/las_madreselvas_tenis?igshid=6pkeh7as6wlq",
            "web": "",
            "whatsapp": "https://api.whatsapp.com/send?phone=59898524797",
            "telefonos": [],
            "valoraciones": [],
            "videos": []
        }, {
            "nombre": "Club Fraternidad",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": false,
            "accesibilidad": false,
            "descripcion": "<p>Se iniciaron los trabajos preliminares el 18 de agosto de 1898, ocupando la presidencia, de la primera Comisión Directiva, el Dr. Jorge Arias.</p> <p>El edificio actual se inauguró el 1 de enero de 1901, habiendo sido sucesivamente ampliado y reformado, conservando siempre su planta primitiva.</p> <p>La actividad social y cultural ha sido permanente, figurando en sus registros, las familias más representativas de la sociedad de San José.</p> <p>Por sus salones han desfilado personajes destacados del ambiente artístico nacional, siendo huéspedes altos valores del país, así como del extranjero, acogidos todos ellos con general simpatía y cordialidad. Fueron agasajados varios Presidentes de la Nación, entre otros los señores Willimann, Viera, Brum, Terra, Batlle Berres; personalidades extranjeras,  entre ellas el General Caviglia, del Ejército Italiano; el señor Baptista Luzardo, Ministro de los Estados Unidos de Brasil; el Príncipe Simone de la Casa Real Italiana, en su viaje al Plata; entre otros.</p> <p>En el plano de la cultura: el pianista Hugo Balzo, las concertistas compatriotas Bettina Rivero, Fanny Ingold y la argentina Corita Achaval; el profesor José Legu; los guitarristas Julio Martinez Oyanguren , César Viglietti, Ramón Ayestaran; Atahualpa Yupanqui; el pianista español Carlos Kussrrow Corma; los violinistas Carlos Demicheri, María Celia M. de Zugasti y Roger Salmón.</p> <p>Además, ha sido centro de grandes conferencias, tales como los doctores Carlos María Prando, Dardo Regules, Juan J. Carbajal Victorica, señores como Lauro Ayestaran; escritores como Ernesto Pinto, Francisco Espínola ( hijo ), Eugenio Villagrán Bustamante; Doctor Rodolfo Talice, Manuel Benavente, entre otros.</p> <p>El Club ha sido pionero en los bailes de carnaval, en particular los asaltos de máscaras; el Sábado de Gloria y el 24 de Agosto, que congregan a elementos representativos de San José, Montevideo y otras ciudades\".<p>  <p><b>Fuente: </b> Profesor Alexis Collazo, material extraído de una publicación sobre la Muestra Industrial de San José, de 1949. Colaboraron en esa publicación, los señores Salvador y Francisco S. Donato y Eugenio Villagrán Bustamante. Agosto 1949.</p>",
            "imagenHome": {
                "name": "fraternidad",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Ffraternidad.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "fraternidad-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Ffraternidad-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.715883,
                "lat": -34.338884
            },
            "tipo": "Urbano",
            "imagenes": [{
                "name": "fraternidad-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Ffraternidad-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "fraternidad-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Ffraternidad-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "https://www.facebook.com/fraternidadclubok/",
            "instagram": "",
            "web": "",
            "whatsapp": "https://api.whatsapp.com/send?phone=59899191099",
            "telefonos": [{
                "numero": "43431702"
            }],
            "valoraciones": [],
            "videos": []
        }, {
            "nombre": "Sociedad Italiana",
            "prioridad": 0,
            "publicado": true,
            "departamento": "San José",
            "localidad": "San José De Mayo",
            "auto": true,
            "bicicleta": true,
            "caminar": true,
            "patrimonial": true,
            "accesibilidad": false,
            "descripcion": "<p><p><b>Breve reseña histórica</p> </b> San José no estuvo ajeno a la gran corriente inmigratoria que durante el siglo XIX desde el Viejo Mundo arribó al Río de la Plata. Aluvión inmigratorio en el cual se destacó cualitativa y cuantitativamente la vertiente italiana</p> <p>Itálicos que antes y después de la unificación total de Italia, al instalarse en nuestro suelo maragato, comenzaron a unirse con criterios variados, unos de acuerdo con su zona o región de procedencia, en consonancia con las jurisdicciones políticas de sus respectivos lugares de origen, y otros de acuerdo con sus actividades y oficios.</p> <p>En el entendido que la unión, la solidaridad , el ¨mutuo soccorso¨ genera la fuerza para sobrellevar mejor la nostalgia por la tierra dejada, mitiga el dolor del desarraigo familiar y posibilita la satisfacción de las necesidades materiales, esos inmigrantes se asociaron dando así nacimiento en nuestra ciudad de San José de Mayo entre otras a la Societa Italiana Di Mutuo Soccorso fundada el 29 de agosto de 1869.</p> <p><p><b>El Piccolo Teatro “Dante Alighieri</b></p> San José cuenta con varios edificios que han de considerarse referencia válida de su devenir histórico y sin duda que el citado es uno de ellos.</p> <p>La Sociedad Italiana es el producto de la acción de inmigrantes cuya llegada al país no fue precisamente consecuencia de un desborde económico , sino más bien de lo contrario, su llegada significó la necesidad de buscar otros horizontes mejores que los disponibles en su tierra.</p> <p>El diseño de la sede, con un modelo trasplantado de su tierra, mantendría la conformación que les permitiera, a la distancia, tener siempre presente a los viejos maestros que construyeron su entorno natal.</p> <p>Se emplazó en un sitio que distaba de ser la esquina privilegiada que es hoy. Muy cerca funcionaba un tambo ( seguramente explotado por algún vasco, perteneciente a la otra corriente inmigratoria mayoritaria de entonces que no olvidamos )</p> <p>Sus materiales eran los disponibles en la época: ladrillos, cal, tierra romana, madera y chapas de cinc. Su forma copiaba las diferentes fórmulas estilísticas de los edificios públicos y su capacidad técnica les permitía desarrollar con solvencia de ejecución y proporción agradable, todo lo programado. Construyeron un acceso enmarcado en un pórtico de dobles columnas jónicas sobre pedestal, y se dieron el gusto de dotarlas de sus listeles, toros, escocias, estrías semicirculares y terminarlas en capiteles con sus volutas correspondientes.</p> <p>La existencia de dicho edificio, notorio testimonio de un siglo atrás en el presente, comprende el triple mensaje ya expresado que lo hace digno de reconocimiento y merecedor de ser reconocido como auténtico patrimonio del departamento:</p> <ul><li>La riqueza artesanal de su ejecución</li> <li>La capacidad de aquellos inmigrantes de enfrentar una empresa al límite de sus posibilidades</li> <li>La expresión del propósito de permanencia de su aventura solidaria en esta tierra de San José</li></ul><p>Fuente información trabajo realizado por Miguel Senattore Villero y arq. Carlos Diana</p>    ",
            "imagenHome": {
                "name": "italiana",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugaresHome%2Fitaliana.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "imagenPrincipal": {
                "name": "italiana-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fitaliana-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            },
            "ubicacion": {
                "lng": -56.71336,
                "lat": -34.341949
            },
            "tipo": "Urbano",
            "imagenes": [{
                "name": "italiana-1",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fitaliana-1.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }, {
                "name": "italiana-2",
                "url": "https://firebasestorage.googleapis.com/v0/b/appdominga.appspot.com/o/lugares%2Fitaliana-2.jpg?alt=media&token=7cbc502b-13fc-4b19-b1b5-6bf30aea69c3"
            }],
            "facebook": "",
            "instagram": "",
            "web": "",
            "whatsapp": "",
            "telefonos": [],
            "valoracioneses": [],
            "videos": []
        }];

        for (let i = 0; i < datos.length; i++) {
            this.afs.collection('lugares').add(datos[i]);
        }
    }


}
