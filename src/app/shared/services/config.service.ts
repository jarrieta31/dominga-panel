import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction, DocumentReference, DocumentData } from '@angular/fire/compat/firestore';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Departamento } from '../interfaces/departamento';
import { LocalStorageService } from './local-storage.service';



@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    localidades$: Subject<string[]>;
    departamentos$: Subject<string[]>
    listLocalidades: string[] = [];
    listDptosActivos: string[] = [];
    departamentos: Departamento[] = [];
    tiposEventos: string[] = [];
    tiposLugares: string[] = [];
    

    constructor(
        private localStorageService: LocalStorageService,
        private afs: AngularFirestore) {
        this.localidades$ = new Subject();
        this.departamentos$ = new Subject();
        this.getDepartamentosFirestore();
    }

    /** retorna el observable de localidades */
    getObsLocalidades(): Observable<string[]> {
        return this.localidades$.asObservable();
    }

    /** retorna el observable de departamentos */
    getObsDepartamentos(): Observable<string[]> {
        return this.departamentos$.asObservable();
    }

    /** Obtiene los departamentos activos con sus localidades desde firestore 
     * y los guarda en el array listDptosActivos
    */
    getDepartamentosFirestore() {
        this.afs.collection('departamentos').ref.where('status', "==", true).get().then(
            querySnapshot => {
                const arrDepartamentos: any[] = [];
                querySnapshot.forEach(item => {
                    const data: any = item.data()
                    arrDepartamentos.push({ id: item.id, ...data });
                })
                this.departamentos = JSON.parse(JSON.stringify(arrDepartamentos));
                this.departamentos.forEach(dpto => {
                    this.listDptosActivos.push(dpto.nombre);
                });
                this.reordenarDepartamentoPorNombre();
                this.emitirDepartamentosActivos();
                this.getLocadidadesDepartamento(this.localStorageService.departamento);
            }
        ).catch(error => {
            console.error("Error en getDepartamentosFirestore(). error:" + error);
        })

    }

    /** cargar el subject localidades$ con las localidades
     * del departamento seleccionado y emite sus valores
     */
    getLocadidadesDepartamento(departamento: string) {
        let arrLocalidades: string[] = [];
        this.departamentos.forEach(dep => {
            if (dep.nombre === departamento) {
                let dpto = JSON.parse(JSON.stringify(dep));
                arrLocalidades = dpto.localidades
            }
        });
        this.listLocalidades = arrLocalidades;
        this.localidades$.next(arrLocalidades);
    }

    emitirDepartamentosActivos(): void {
        this.departamentos$.next(this.listDptosActivos);
    }

    emitirLocalidades(): void {
        this.localidades$.next(this.listLocalidades);
    }

    //    update(id: string, data: any): Promise<void> {
    //      return this.afs.collection('departamentos').doc(id).update(data);
    //}

    delete(id: string): Promise<void> {
        return this.afs.collection('departamentos').doc(id).delete();
    }

    /** Método para llenar la base de datos con las localidades los departamentos de todo el país */
    cargarDepartamentos() {
        const datos = [
            {
                "nombre": "Artigas",
                "status": false,
                "localidades": [
                    "Artigas",
                    "Bella Unión",
                    "Bernabe Rivera",
                    "Cainsa",
                    "Calnu",
                    "Cerro Ejido",
                    "Cerro San Eugenio",
                    "Cerro Signorelli (El Mirador)",
                    "Colonia Palma",
                    "Coronado",
                    "Cuareim",
                    "Cuaro",
                    "Diego Lamas",
                    "Franquia",
                    "Javier De Viana",
                    "La Bolsa",
                    "Las Piedras",
                    "Mones Quintela",
                    "Paso Campamento",
                    "Paso Farias",
                    "Pintadito",
                    "Port. De Hierro Y Campodonico",
                    "Rincón De Pacheco",
                    "Sequeira",
                    "Tomas Gomensoro",
                    "Topador"
                ]
            },
            {
                "nombre": "Canelones",
                "status": false,
                "localidades": [
                    "Aeropuerto Internacional De Carras",
                    "Aguas Corrientes",
                    "Altos De La Tahona",
                    "Araminda",
                    "Argentino",
                    "Atlantida",
                    "Barra De Carrasco",
                    "Barrio Copola",
                    "Barrio Remanso",
                    "Barros Blancos",
                    "Bello Horizonte",
                    "Biarritz",
                    "Bolivar",
                    "Campo Militar",
                    "Canelones",
                    "Capilla De Cella",
                    "Carmel",
                    "Castellanos",
                    "Cerrillos",
                    "City Golf",
                    "Colinas De Carrasco",
                    "Colinas De Solymar",
                    "Colonia Nicolich",
                    "Costa Azul",
                    "Costa Y Guillamon",
                    "Cruz De Los Caminos",
                    "Cuchilla Alta",
                    "Cumbres De Carrasco",
                    "Dr. Francisco Soca",
                    "El Bosque",
                    "El Galeon",
                    "El Pinar",
                    "Empalme Olmos",
                    "Estacion Atlantida",
                    "Estacion La Floresta",
                    "Estacion Migues",
                    "Estacion Pedrera",
                    "Estacion Piedras De Afilar",
                    "Estacion Tapia",
                    "Estanque De Pando",
                    "Fortin De Santa Rosa",
                    "Fracc. Cno. Andaluz Y R.84",
                    "Fracc. Progreso",
                    "Fracc. Sobre Ruta 74",
                    "Guazu - Vira",
                    "Haras Del Lago",
                    "Instituto Adventista",
                    "Jardines De Pando",
                    "Jaureguiberry",
                    "Joaquin Suarez",
                    "Juanico",
                    "La Asuncion",
                    "La Floresta",
                    "La Lucha",
                    "La Montañesa",
                    "La Paz",
                    "La Tuna",
                    "Lagomar",
                    "Las Higueritas",
                    "Las Piedras",
                    "Las Toscas",
                    "Lomas De Carrasco",
                    "Lomas De Solymar",
                    "Los Titanes",
                    "Marindia",
                    "Migues",
                    "Montes",
                    "Neptunia",
                    "Olmos",
                    "Pando",
                    "Parada Cabrera",
                    "Parque Carrasco",
                    "Parque Del Plata",
                    "Paso Carrasco",
                    "Paso De La Cadena",
                    "Paso De Pache",
                    "Paso Espinosa",
                    "Paso Palomeque",
                    "Piedra Del Toro",
                    "Piedras De Afilar",
                    "Pinamar - Pinepark",
                    "Progreso",
                    "Quinta Los Horneros",
                    "Quintas Del Bosque",
                    "Salinas",
                    "San Antonio",
                    "San Bautista",
                    "San Jacinto",
                    "San José De Carrasco",
                    "San Luis",
                    "San Ramon",
                    "Santa Ana",
                    "Santa Lucia",
                    "Santa Lucia Del Este",
                    "Santa Rosa",
                    "Sauce",
                    "Seis Hermanos",
                    "Shangrila",
                    "Sofia Santos",
                    "Solymar",
                    "Tala",
                    "Toledo",
                    "Totoral Del Sauce",
                    "Viejo Molino San Bernardo",
                    "Villa Aeroparque",
                    "Villa Arejo",
                    "Villa Argentina",
                    "Villa Crespo Y San Andres",
                    "Villa El Tato",
                    "Villa Felicidad",
                    "Villa Hadita",
                    "Villa Juana",
                    "Villa Paz S.A.",
                    "Villa Porvenir",
                    "Villa San Cono",
                    "Villa San Felipe",
                    "Villa San José"
                ]
            },
            {
                "nombre": "Cerro Largo",
                "status": false,
                "localidades": [
                    "Acegua",
                    "Arachania",
                    "Arbolito",
                    "Arevalo",
                    "Barrio La Vinchuca",
                    "Barrio Lopez Benitez",
                    "Bañado De Medina",
                    "Caserio Las Cañas",
                    "Centurion",
                    "Cerro De Las Cuentas",
                    "Esperanza",
                    "Fraile Muerto",
                    "Getulio Vargas",
                    "Hipodromo",
                    "Isidoro Noblia",
                    "La Pedrera",
                    "Lago Merin",
                    "Mangrullo",
                    "Melo",
                    "Nando",
                    "Ñangapire",
                    "Placido Rosas",
                    "Poblado Uruguay",
                    "Quebracho",
                    "Ramon Trigo",
                    "Rio Branco",
                    "Soto Goro",
                    "Toledo",
                    "Tres Islas",
                    "Tupambae"
                ]
            },
            {
                "nombre": "Colonia",
                "status": true,
                "localidades": [
                    "Agraciada",
                    "Arrivillaga",
                    "Artilleros",
                    "Barker",
                    "Blanca Arena",
                    "Boca Del Rosario",
                    "Brisas Del Plata",
                    "Campana",
                    "Carmelo",
                    "Caserio El Cerro",
                    "Cerro Carmelo",
                    "Cerros De San Juan",
                    "Chico Torino",
                    "Colonia Cosmopolita",
                    "Colonia Del Sacramento",
                    "Colonia Valdense",
                    "Conchillas",
                    "Cufre",
                    "El Ensueño",
                    "El Faro",
                    "El Quinton",
                    "El Semillero",
                    "Estacion Estanzuela",
                    "Florencio Sanchez",
                    "Juan Carlos Caseros",
                    "Juan Jackson",
                    "Juan Lacaze",
                    "La Horqueta",
                    "La Paz",
                    "Laguna De Los Patos",
                    "Los Pinos",
                    "Miguelete",
                    "Nueva Helvecia",
                    "Nueva Palmira",
                    "Ombues De Lavalle",
                    "Paraje Minuano",
                    "Paso Antolin",
                    "Playa Azul",
                    "Playa Britopolis",
                    "Playa Fomento",
                    "Playa Parant",
                    "Pueblo Gil",
                    "Puerto Ingles",
                    "Radial Hernandez",
                    "Riachuelo",
                    "Rosario",
                    "San Pedro",
                    "Santa Ana",
                    "Santa Regina",
                    "Tarariras",
                    "Zagarzazu"
                ]
            },
            {
                "nombre": "Durazno",
                "status": false,
                "localidades": [
                    "Aguas Buenas",
                    "Baygorria",
                    "Blanquillo",
                    "Carlos Reyles",
                    "Carmen",
                    "Centenario",
                    "Cerro Chato",
                    "Durazno",
                    "Feliciano",
                    "La Paloma",
                    "Las Palmas",
                    "Ombues De Oribe",
                    "Pueblo De Alvarez",
                    "Rossell Y Rius",
                    "San Jorge",
                    "Santa Bernardina",
                    "Sarandi Del Yi"
                ]
            },
            {
                "nombre": "Flores",
                "status": false,
                "localidades": [
                    "Andresito",
                    "Cerro Colorado",
                    "Ismael Cortinas",
                    "Juan Jose Castro",
                    "La Casilla",
                    "Trinidad"
                ]
            },
            {
                "nombre": "Florida",
                "status": false,
                "localidades": [
                    "25 De Agosto",
                    "25 De Mayo",
                    "Alejandro Gallinal",
                    "Berrondo",
                    "Capilla Del Sauce",
                    "Cardal",
                    "Caserio La Fundacion",
                    "Casupa",
                    "Cerro Chato",
                    "Chamizo",
                    "Estacion Capilla Del Sauce",
                    "Florida",
                    "Fray Marcos",
                    "Goñi",
                    "Illescas",
                    "Independencia",
                    "La Cruz",
                    "La Macana",
                    "Mendoza",
                    "Mendoza Chico",
                    "Montecoral",
                    "Nico Perez",
                    "Pintado",
                    "Polanco Del Yi",
                    "Pueblo Ferrer",
                    "Puntas De Maciel",
                    "Reboledo",
                    "San Gabriel",
                    "Sarandi Grande",
                    "Valentines"
                ]
            },
            {
                "nombre": "Lavalle",
                "status": false,
                "localidades": [
                    "19 De Junio",
                    "Aramendia",
                    "Barrio La Coronilla - Ancap",
                    "Blanes Viale",
                    "Colon",
                    "Estacion Solis",
                    "Gaetan",
                    "Illescas",
                    "Jose Batlle Y Ordoñez",
                    "Jose Pedro Varela",
                    "Mariscala",
                    "Minas",
                    "Piraraja",
                    "Polanco Norte",
                    "San Francisco De Las Sierras",
                    "Solis De Mataojo",
                    "Villa Del Rosario",
                    "Villa Serrana",
                    "Zapican"
                ]
            },
            {
                "nombre": "Maldonado",
                "status": false,
                "localidades": [
                    "Aigua",
                    "Arenas De Jose Ignacio",
                    "Balneario Buenos Aires",
                    "Barrio Hipodromo",
                    "Bella Vista",
                    "Canteras De Marelli",
                    "Cerro Pelado",
                    "Cerros Azules",
                    "Chihuahua",
                    "Eden Rock",
                    "El Chorro",
                    "El Eden",
                    "El Quijote",
                    "El Tesoro",
                    "Faro Jose Ignacio",
                    "Garzon",
                    "Gerona",
                    "Gregorio Aznarez",
                    "La Barra",
                    "La Capuera",
                    "La Sonrisa",
                    "Laguna Blanca",
                    "Las Cumbres",
                    "Las Flores",
                    "Las Flores - Estacion",
                    "Los Aromos",
                    "Los Corchos",
                    "Los Talas",
                    "Maldonado",
                    "Manantiales",
                    "Nueva Carrara",
                    "Ocean Park",
                    "Pan De Azucar",
                    "Parque Medina",
                    "Pinares - Las Delicias",
                    "Piriapolis",
                    "Playa Grande",
                    "Playa Hermosa",
                    "Playa Verde",
                    "Pueblo Solis",
                    "Punta Ballena",
                    "Punta Colorada",
                    "Punta Del Este",
                    "Punta Negra",
                    "Ruta 37 Y 9",
                    "San Carlos",
                    "San Rafael - El Placer",
                    "San Vicente",
                    "Santa Monica",
                    "Sauce De Portezuelo",
                    "Solis",
                    "Villa Delia"
                ]
            },
            {
                "nombre": "Montevideo",
                "status": false,
                "localidades": [
                    "Montevideo"
                ]
            },
            {
                "nombre": "Paysandú",
                "status": false,
                "localidades": [
                    "Porvenir",
                    "Araujo",
                    "Arbolito",
                    "Beisso",
                    "Bella Vista",
                    "Cañada Del Pueblo",
                    "Casablanca",
                    "Cerro Chato",
                    "Chacras De Paysandú",
                    "Chapicuy",
                    "Constancia",
                    "Cuchilla De Buricayupi",
                    "Cuchilla De Fuego",
                    "El Eucaliptus",
                    "Esperanza",
                    "Estacion Porvenir",
                    "Gallinal",
                    "Guichon",
                    "La Tentacion",
                    "Lorenzo Geyres",
                    "Merinos",
                    "Morato",
                    "Nuevo Paysandú",
                    "Orgoroso",
                    "Paysandú",
                    "Piñera",
                    "Piedra Sola",
                    "Piedras Coloradas",
                    "Pueblo Alonzo",
                    "Pueblo Federacion",
                    "Puntas De Arroyo Negro",
                    "Quebracho",
                    "Queguayar",
                    "San Felix",
                    "Soto",
                    "Tambores",
                    "Termas De Almiron",
                    "Termas De Guaviyu",
                    "Villa Maria (Tiatucura)",
                    "Zeballos"
                ]
            },
            {
                "nombre": "Río Negro",
                "status": false,
                "localidades": [
                    "Algorta",
                    "Barrio Anglo",
                    "Bellaco",
                    "El Ombu",
                    "Fray Bentos",
                    "Grecco",
                    "Las Cañas",
                    "Los Arrayanes",
                    "Menafra",
                    "Merinos",
                    "Nuevo Berlin",
                    "Paso De Los Mellizos",
                    "San Javier",
                    "Sarandi De Navarro",
                    "Tres Quintas",
                    "Villa General Borges",
                    "Villa Maria",
                    "Young"
                ]
            },
            {
                "nombre": "Rivera",
                "status": false,
                "localidades": [
                    "Amarillo",
                    "Arroyo Blanco",
                    "Cerrillada",
                    "Cerro Pelado",
                    "Cerros De La Calera",
                    "La Pedrera",
                    "Lagos Del Norte",
                    "Lagunon",
                    "Lapuente",
                    "Las Flores",
                    "Mandubi",
                    "Masoller",
                    "Minas De Corrales",
                    "Moirones",
                    "Paso Ataques",
                    "Paso Hospital",
                    "Rivera",
                    "Santa Teresa",
                    "Tranqueras",
                    "Vichadero"
                ]
            },
            {
                "nombre": "Rocha",
                "status": false,
                "localidades": [
                    "18 De Julio",
                    "19 De Abril",
                    "Aguas Dulces",
                    "Arachania",
                    "Barra De Valizas",
                    "Barra Del Chuy",
                    "Barrio Pereira",
                    "Barrio Torres",
                    "Cabo Polonio",
                    "Capacho",
                    "Castillos",
                    "Cebollati",
                    "Chuy",
                    "La Aguada Y Costa Azul",
                    "La Coronilla",
                    "La Esmeralda",
                    "La Paloma",
                    "La Pedrera",
                    "La Ribiera",
                    "Lascano",
                    "Oceania Del Polonio",
                    "Palmares De La Coronilla",
                    "Paralle",
                    "Pta. Rubia Y Sta. Isabel De La Ped",
                    "Pueblo Nuevo",
                    "Puente Valizas",
                    "Puerto De Los Botes",
                    "Puimayen",
                    "Punta Del Diablo",
                    "Rocha",
                    "San Antonio",
                    "San Luis Al Medio",
                    "Tajamares De La Pedrera",
                    "Velazquez"
                ]
            },
            {
                "nombre": "Salto",
                "status": false,
                "localidades": [
                    "Albisu",
                    "Arenitas Blancas",
                    "Belen",
                    "Biassini",
                    "Campo De Todos",
                    "Cayetano",
                    "Celeste",
                    "Cerros De Vera",
                    "Chacras De Belen",
                    "Colonia 18 De Julio",
                    "Colonia Itapebi",
                    "Constitucion",
                    "Cuchilla De Guaviyu",
                    "Fernandez",
                    "Garibaldi",
                    "Guaviyu De Arapey",
                    "Las Flores",
                    "Laureles",
                    "Lluveras",
                    "Migliaro",
                    "Olivera",
                    "Osimani Y Llerena",
                    "Palomas",
                    "Parque Jose Luis",
                    "Paso Cementerio",
                    "Paso De Las Piedras De Arerungua",
                    "Paso Del Parque Del Dayman",
                    "Puntas De Valentin",
                    "Quintana",
                    "Rincon De Valentin",
                    "Russo",
                    "Salto",
                    "San Antonio",
                    "Sarandi De Arapey",
                    "Saucedo",
                    "Termas Del Arapey",
                    "Termas Del Dayman"
                ]
            },
            {
                "nombre": "San José",
                "status": true,
                "localidades": [
                    "Boca Del Cufre",
                    "Capurro",
                    "Carreta Quemada",
                    "Cañada Grande",
                    "Ceramicas Del Sur",
                    "Cololo Tinosa",
                    "Colonia Delta",
                    "Costas De Pereira",
                    "Delta Del Tigre Y Villas",
                    "Ecilda Paullier",
                    "Gonzalez",
                    "Ituzaingo",
                    "Juan Soler",
                    "Kiyu-Ordeig",
                    "La Boyada",
                    "Libertad",
                    "Mal Abrigo",
                    "Mangrullo",
                    "Monte Grande",
                    "Playa Pascual",
                    "Pueblo Nuevo",
                    "Puntas De Valdez",
                    "Radial",
                    "Rafael Peraza",
                    "Raigón",
                    "Rincón Del Pino",
                    "Rodríguez",
                    "Safici (Parque Postel)",
                    "San Gregorio",
                    "San José De Mayo",
                    "Santa Mónica",
                    "Scavino",
                    "Villa María"
                ]
            },
            {
                "nombre": "Soriano",
                "status": false,
                "localidades": [
                    "Agraciada",
                    "Cañada Nieto",
                    "Cardona",
                    "Castillos",
                    "Chacras De Dolores",
                    "Colonia Concordia",
                    "Cuchilla Del Perdido",
                    "Dolores",
                    "Egaña",
                    "El Tala",
                    "Jose Enrique Rodo",
                    "La Concordia",
                    "La Loma",
                    "Lares",
                    "Mercedes",
                    "Palmar",
                    "Palmitas",
                    "Palo Solo",
                    "Perseverano",
                    "Risso",
                    "Sacachispas",
                    "Santa Catalina",
                    "Villa Soriano"
                ]
            },
            {
                "nombre": "Tacuarembó",
                "status": false,
                "localidades": [
                    "Achar",
                    "Ansina",
                    "Balneario Ipora",
                    "Cardozo",
                    "Cerro De Pastoreo",
                    "Chamberlain",
                    "Clara",
                    "Cruz De Los Caminos",
                    "Cuchilla De Peralta",
                    "Cuchilla Del Ombu",
                    "Curtina",
                    "La Hilera",
                    "La Pedrera",
                    "Las Toscas",
                    "Laureles",
                    "Montevideo Chico",
                    "Paso Bonilla",
                    "Paso De Los Toros",
                    "Paso Del Cerro",
                    "Piedra Sola",
                    "Pueblo De Arriba",
                    "Pueblo Del Barro",
                    "Punta De Carretera",
                    "Puntas De Cinco Sauces",
                    "Rincon De Pereira",
                    "Rincon Del Bonete",
                    "San Gregorio De Polanco",
                    "Sauce De Batovi",
                    "Tacuarembó",
                    "Tambores"
                ]
            },
            {
                "nombre": "Treinta y Tres",
                "status": false,
                "localidades": [
                    "Arrocera Bonomo",
                    "Arrocera El Tigre",
                    "Arrocera La Catumbera",
                    "Arrocera La Querencia",
                    "Arrocera Las Palmas",
                    "Arrocera Los Ceibos",
                    "Arrocera Los Teros",
                    "Arrocera Mini",
                    "Arrocera Procipa",
                    "Arrocera Rincon",
                    "Arrocera San Fernando",
                    "Arrocera Santa Fe",
                    "Arrocera Zapata",
                    "Arrozal Treinta y Tress",
                    "Cerro Chato",
                    "Ejido De Treinta y Tress",
                    "El Bellaco",
                    "Estacion Rincon",
                    "Gral. Enrique Martinez",
                    "Isla Patrulla (Maria Isabel)",
                    "Maria Albina",
                    "Mendizabal (El Oro)",
                    "Poblado Alonzo",
                    "Puntas Del Parao",
                    "Santa Clara De Olimar",
                    "Treinta y Tress",
                    "Valentines",
                    "Vergara",
                    "Villa Passano",
                    "Villa Sara"
                ]
            }
        ];

        datos.forEach(departamento => {
            this.afs.collection('departamentos').add(departamento);
        });
    }

    /**
     * Ordena el array local todosLosLugares(no se usa porque corregir prioridades ya lo soluciona )
     * Ojo puede servir para ordenar por orden alfabético
     */
    reordenarDepartamentoPorNombre() {
        this.listDptosActivos.sort(this.compararNombre);
    }

    /** Función para comparar las prioridades de los lugares, funciona como auxiliar de la función reordenarLugaresPorPrioridad() */
    compararNombre(a: string, b: string): number {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        // a debe ser igual b
        return 0;
    }


}
