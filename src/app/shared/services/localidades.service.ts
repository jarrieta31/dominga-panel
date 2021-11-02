import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction, DocumentReference, DocumentData } from '@angular/fire/compat/firestore';
import { Localidad } from '../interfaces/localidad.interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocalidadesService {

  private localidadesCollection: AngularFirestoreCollection<Localidad>;
  localidades$: Observable<Localidad[]>;
  localidadesRef: AngularFirestoreCollection<Localidad>;

  constructor(
    private db: AngularFirestore) {
    this.localidadesCollection = this.db.collection<Localidad>('localidades');
    this.localidadesRef = db.collection('localidades');

    //Por ahora no se esta usando pero es otra manera de obtener todos las localidades
    //this.localidades$ = this.db.collection<Localidad>('localidades')
    //  .snapshotChanges().pipe(
    //    map(actions => actions.map(a => {
    //      const data = a.payload.doc.data() as Localidad;
    //      const id = a.payload.doc.id;
    //      return { id, ...data };
    //    }))
    //  );
  }

  /**OK Obtiene la colección completa de localidades */
  getAll(): AngularFirestoreCollection<Localidad> {
    return this.localidadesRef;
  }

  getLoadidadesDepartamento(departamento: string) {
    return this.localidadesRef.ref.where('departamento', '==', departamento).get();
  }

  create(localidad: Localidad): any {
    return this.localidadesRef.add(localidad);
  }

  update(id: string, data: any): Promise<void> {
    return this.localidadesRef.doc(id).update(data);
  }

  delete(id: string): Promise<void> {
    return this.localidadesRef.doc(id).delete();
  }

  /** Método para llenar la base de datos con las localidades de todo el país */
  cargarLocalidades() {
    console.log("Cargando localidades")
    const datos = [
      {
        "departamento": "Artigas",
        "nombre": "Artigas"
      },
      {
        "departamento": "Artigas",
        "nombre": "Baltasar Brum"
      },
      {
        "departamento": "Artigas",
        "nombre": "Bella Union"
      },
      {
        "departamento": "Artigas",
        "nombre": "Bernabe Rivera"
      },
      {
        "departamento": "Artigas",
        "nombre": "Cainsa"
      },
      {
        "departamento": "Artigas",
        "nombre": "Calnu"
      },
      {
        "departamento": "Artigas",
        "nombre": "Cerro Ejido"
      },
      {
        "departamento": "Artigas",
        "nombre": "Cerro San Eugenio"
      },
      {
        "departamento": "Artigas",
        "nombre": "Cerro Signorelli (El Mirador)"
      },
      {
        "departamento": "Artigas",
        "nombre": "Colonia Palma"
      },
      {
        "departamento": "Artigas",
        "nombre": "Coronado"
      },
      {
        "departamento": "Artigas",
        "nombre": "Cuareim"
      },
      {
        "departamento": "Artigas",
        "nombre": "Cuaro"
      },
      {
        "departamento": "Artigas",
        "nombre": "Diego Lamas"
      },
      {
        "departamento": "Artigas",
        "nombre": "Franquia"
      },
      {
        "departamento": "Artigas",
        "nombre": "Javier De Viana"
      },
      {
        "departamento": "Artigas",
        "nombre": "La Bolsa"
      },
      {
        "departamento": "Artigas",
        "nombre": "Las Piedras"
      },
      {
        "departamento": "Artigas",
        "nombre": "Mones Quintela"
      },
      {
        "departamento": "Artigas",
        "nombre": "Paso Campamento"
      },
      {
        "departamento": "Artigas",
        "nombre": "Paso Farias"
      },
      {
        "departamento": "Artigas",
        "nombre": "Pintadito"
      },
      {
        "departamento": "Artigas",
        "nombre": "Port. De Hierro Y Campodonico"
      },
      {
        "departamento": "Artigas",
        "nombre": "Rincon De Pacheco"
      },
      {
        "departamento": "Artigas",
        "nombre": "Sequeira"
      },
      {
        "departamento": "Artigas",
        "nombre": "Tomas Gomensoro"
      },
      {
        "departamento": "Artigas",
        "nombre": "Topador"
      },
      {
        "departamento": "Canelones",
        "nombre": "Aeropuerto Internacional De Carras"
      },
      {
        "departamento": "Canelones",
        "nombre": "Aguas Corrientes"
      },
      {
        "departamento": "Canelones",
        "nombre": "Altos De La Tahona"
      },
      {
        "departamento": "Canelones",
        "nombre": "Araminda"
      },
      {
        "departamento": "Canelones",
        "nombre": "Argentino"
      },
      {
        "departamento": "Canelones",
        "nombre": "Atlantida"
      },
      {
        "departamento": "Canelones",
        "nombre": "Barra De Carrasco"
      },
      {
        "departamento": "Canelones",
        "nombre": "Barrio Copola"
      },
      {
        "departamento": "Canelones",
        "nombre": "Barrio Remanso"
      },
      {
        "departamento": "Canelones",
        "nombre": "Barros Blancos"
      },
      {
        "departamento": "Canelones",
        "nombre": "Bello Horizonte"
      },
      {
        "departamento": "Canelones",
        "nombre": "Biarritz"
      },
      {
        "departamento": "Canelones",
        "nombre": "Bolivar"
      },
      {
        "departamento": "Canelones",
        "nombre": "Campo Militar"
      },
      {
        "departamento": "Canelones",
        "nombre": "Canelones"
      },
      {
        "departamento": "Canelones",
        "nombre": "Capilla De Cella"
      },
      {
        "departamento": "Canelones",
        "nombre": "Carmel"
      },
      {
        "departamento": "Canelones",
        "nombre": "Castellanos"
      },
      {
        "departamento": "Canelones",
        "nombre": "Cerrillos"
      },
      {
        "departamento": "Canelones",
        "nombre": "City Golf"
      },
      {
        "departamento": "Canelones",
        "nombre": "Colinas De Carrasco"
      },
      {
        "departamento": "Canelones",
        "nombre": "Colinas De Solymar"
      },
      {
        "departamento": "Canelones",
        "nombre": "Colonia Nicolich"
      },
      {
        "departamento": "Canelones",
        "nombre": "Costa Azul"
      },
      {
        "departamento": "Canelones",
        "nombre": "Costa Y Guillamon"
      },
      {
        "departamento": "Canelones",
        "nombre": "Cruz De Los Caminos"
      },
      {
        "departamento": "Canelones",
        "nombre": "Cuchilla Alta"
      },
      {
        "departamento": "Canelones",
        "nombre": "Cumbres De Carrasco"
      },
      {
        "departamento": "Canelones",
        "nombre": "Dr. Francisco Soca"
      },
      {
        "departamento": "Canelones",
        "nombre": "El Bosque"
      },
      {
        "departamento": "Canelones",
        "nombre": "El Galeon"
      },
      {
        "departamento": "Canelones",
        "nombre": "El Pinar"
      },
      {
        "departamento": "Canelones",
        "nombre": "Empalme Olmos"
      },
      {
        "departamento": "Canelones",
        "nombre": "Estacion Atlantida"
      },
      {
        "departamento": "Canelones",
        "nombre": "Estacion La Floresta"
      },
      {
        "departamento": "Canelones",
        "nombre": "Estacion Migues"
      },
      {
        "departamento": "Canelones",
        "nombre": "Estacion Pedrera"
      },
      {
        "departamento": "Canelones",
        "nombre": "Estacion Piedras De Afilar"
      },
      {
        "departamento": "Canelones",
        "nombre": "Estacion Tapia"
      },
      {
        "departamento": "Canelones",
        "nombre": "Estanque De Pando"
      },
      {
        "departamento": "Canelones",
        "nombre": "Fortin De Santa Rosa"
      },
      {
        "departamento": "Canelones",
        "nombre": "Fracc. Cno. Andaluz Y R.84"
      },
      {
        "departamento": "Canelones",
        "nombre": "Fracc. Progreso"
      },
      {
        "departamento": "Canelones",
        "nombre": "Fracc. Sobre Ruta 74"
      },
      {
        "departamento": "Canelones",
        "nombre": "Guazu - Vira"
      },
      {
        "departamento": "Canelones",
        "nombre": "Haras Del Lago"
      },
      {
        "departamento": "Canelones",
        "nombre": "Instituto Adventista"
      },
      {
        "departamento": "Canelones",
        "nombre": "Jardines De Pando"
      },
      {
        "departamento": "Canelones",
        "nombre": "Jaureguiberry"
      },
      {
        "departamento": "Canelones",
        "nombre": "Joaquin Suarez"
      },
      {
        "departamento": "Canelones",
        "nombre": "Juanico"
      },
      {
        "departamento": "Canelones",
        "nombre": "La Asuncion"
      },
      {
        "departamento": "Canelones",
        "nombre": "La Floresta"
      },
      {
        "departamento": "Canelones",
        "nombre": "La Lucha"
      },
      {
        "departamento": "Canelones",
        "nombre": "La Montañesa"
      },
      {
        "departamento": "Canelones",
        "nombre": "La Paz"
      },
      {
        "departamento": "Canelones",
        "nombre": "La Tuna"
      },
      {
        "departamento": "Canelones",
        "nombre": "Lagomar"
      },
      {
        "departamento": "Canelones",
        "nombre": "Las Higueritas"
      },
      {
        "departamento": "Canelones",
        "nombre": "Las Piedras"
      },
      {
        "departamento": "Canelones",
        "nombre": "Las Toscas"
      },
      {
        "departamento": "Canelones",
        "nombre": "Lomas De Carrasco"
      },
      {
        "departamento": "Canelones",
        "nombre": "Lomas De Solymar"
      },
      {
        "departamento": "Canelones",
        "nombre": "Los Titanes"
      },
      {
        "departamento": "Canelones",
        "nombre": "Marindia"
      },
      {
        "departamento": "Canelones",
        "nombre": "Migues"
      },
      {
        "departamento": "Canelones",
        "nombre": "Montes"
      },
      {
        "departamento": "Canelones",
        "nombre": "Neptunia"
      },
      {
        "departamento": "Canelones",
        "nombre": "Olmos"
      },
      {
        "departamento": "Canelones",
        "nombre": "Pando"
      },
      {
        "departamento": "Canelones",
        "nombre": "Parada Cabrera"
      },
      {
        "departamento": "Canelones",
        "nombre": "Parque Carrasco"
      },
      {
        "departamento": "Canelones",
        "nombre": "Parque Del Plata"
      },
      {
        "departamento": "Canelones",
        "nombre": "Paso Carrasco"
      },
      {
        "departamento": "Canelones",
        "nombre": "Paso De La Cadena"
      },
      {
        "departamento": "Canelones",
        "nombre": "Paso De Pache"
      },
      {
        "departamento": "Canelones",
        "nombre": "Paso Espinosa"
      },
      {
        "departamento": "Canelones",
        "nombre": "Paso Palomeque"
      },
      {
        "departamento": "Canelones",
        "nombre": "Piedra Del Toro"
      },
      {
        "departamento": "Canelones",
        "nombre": "Piedras De Afilar"
      },
      {
        "departamento": "Canelones",
        "nombre": "Pinamar - Pinepark"
      },
      {
        "departamento": "Canelones",
        "nombre": "Progreso"
      },
      {
        "departamento": "Canelones",
        "nombre": "Quinta Los Horneros"
      },
      {
        "departamento": "Canelones",
        "nombre": "Quintas Del Bosque"
      },
      {
        "departamento": "Canelones",
        "nombre": "Salinas"
      },
      {
        "departamento": "Canelones",
        "nombre": "San Antonio"
      },
      {
        "departamento": "Canelones",
        "nombre": "San Bautista"
      },
      {
        "departamento": "Canelones",
        "nombre": "San Jacinto"
      },
      {
        "departamento": "Canelones",
        "nombre": "San José De Carrasco"
      },
      {
        "departamento": "Canelones",
        "nombre": "San Luis"
      },
      {
        "departamento": "Canelones",
        "nombre": "San Ramon"
      },
      {
        "departamento": "Canelones",
        "nombre": "Santa Ana"
      },
      {
        "departamento": "Canelones",
        "nombre": "Santa Lucia"
      },
      {
        "departamento": "Canelones",
        "nombre": "Santa Lucia Del Este"
      },
      {
        "departamento": "Canelones",
        "nombre": "Santa Rosa"
      },
      {
        "departamento": "Canelones",
        "nombre": "Sauce"
      },
      {
        "departamento": "Canelones",
        "nombre": "Seis Hermanos"
      },
      {
        "departamento": "Canelones",
        "nombre": "Shangrila"
      },
      {
        "departamento": "Canelones",
        "nombre": "Sofia Santos"
      },
      {
        "departamento": "Canelones",
        "nombre": "Solymar"
      },
      {
        "departamento": "Canelones",
        "nombre": "Tala"
      },
      {
        "departamento": "Canelones",
        "nombre": "Toledo"
      },
      {
        "departamento": "Canelones",
        "nombre": "Totoral Del Sauce"
      },
      {
        "departamento": "Canelones",
        "nombre": "Viejo Molino San Bernardo"
      },
      {
        "departamento": "Canelones",
        "nombre": "Villa Aeroparque"
      },
      {
        "departamento": "Canelones",
        "nombre": "Villa Arejo"
      },
      {
        "departamento": "Canelones",
        "nombre": "Villa Argentina"
      },
      {
        "departamento": "Canelones",
        "nombre": "Villa Crespo Y San Andres"
      },
      {
        "departamento": "Canelones",
        "nombre": "Villa El Tato"
      },
      {
        "departamento": "Canelones",
        "nombre": "Villa Felicidad"
      },
      {
        "departamento": "Canelones",
        "nombre": "Villa Hadita"
      },
      {
        "departamento": "Canelones",
        "nombre": "Villa Juana"
      },
      {
        "departamento": "Canelones",
        "nombre": "Villa Paz S.A."
      },
      {
        "departamento": "Canelones",
        "nombre": "Villa Porvenir"
      },
      {
        "departamento": "Canelones",
        "nombre": "Villa San Cono"
      },
      {
        "departamento": "Canelones",
        "nombre": "Villa San Felipe"
      },
      {
        "departamento": "Canelones",
        "nombre": "Villa San José"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Ñangapire"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Acegua"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Arachania"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Arbolito"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Arevalo"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Bañado De Medina"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Barrio La Vinchuca"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Barrio Lopez Benitez"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Caserio Las Cañas"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Centurion"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Cerro De Las Cuentas"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Esperanza"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Fraile Muerto"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Getulio Vargas"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Hipodromo"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Isidoro Noblia"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "La Pedrera"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Lago Merin"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Mangrullo"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Melo"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Nando"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Placido Rosas"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Poblado Uruguay"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Quebracho"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Ramon Trigo"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Rio Branco"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Soto Goro"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Toledo"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Tres Islas"
      },
      {
        "departamento": "Cerro Largo",
        "nombre": "Tupambae"
      },
      {
        "departamento": "Colonia",
        "nombre": "Agraciada"
      },
      {
        "departamento": "Colonia",
        "nombre": "Arrivillaga"
      },
      {
        "departamento": "Colonia",
        "nombre": "Artilleros"
      },
      {
        "departamento": "Colonia",
        "nombre": "Barker"
      },
      {
        "departamento": "Colonia",
        "nombre": "Blanca Arena"
      },
      {
        "departamento": "Colonia",
        "nombre": "Boca Del Rosario"
      },
      {
        "departamento": "Colonia",
        "nombre": "Brisas Del Plata"
      },
      {
        "departamento": "Colonia",
        "nombre": "Campana"
      },
      {
        "departamento": "Colonia",
        "nombre": "Carmelo"
      },
      {
        "departamento": "Colonia",
        "nombre": "Caserio El Cerro"
      },
      {
        "departamento": "Colonia",
        "nombre": "Cerro Carmelo"
      },
      {
        "departamento": "Colonia",
        "nombre": "Cerros De San Juan"
      },
      {
        "departamento": "Colonia",
        "nombre": "Chico Torino"
      },
      {
        "departamento": "Colonia",
        "nombre": "Colonia Cosmopolita"
      },
      {
        "departamento": "Colonia",
        "nombre": "Colonia Del Sacramento"
      },
      {
        "departamento": "Colonia",
        "nombre": "Colonia Valdense"
      },
      {
        "departamento": "Colonia",
        "nombre": "Conchillas"
      },
      {
        "departamento": "Colonia",
        "nombre": "Cufre"
      },
      {
        "departamento": "Colonia",
        "nombre": "El Ensueño"
      },
      {
        "departamento": "Colonia",
        "nombre": "El Faro"
      },
      {
        "departamento": "Colonia",
        "nombre": "El Quinton"
      },
      {
        "departamento": "Colonia",
        "nombre": "El Semillero"
      },
      {
        "departamento": "Colonia",
        "nombre": "Estacion Estanzuela"
      },
      {
        "departamento": "Colonia",
        "nombre": "Florencio Sanchez"
      },
      {
        "departamento": "Colonia",
        "nombre": "Juan Carlos Caseros"
      },
      {
        "departamento": "Colonia",
        "nombre": "Juan Jackson"
      },
      {
        "departamento": "Colonia",
        "nombre": "Juan Lacaze"
      },
      {
        "departamento": "Colonia",
        "nombre": "La Horqueta"
      },
      {
        "departamento": "Colonia",
        "nombre": "La Paz"
      },
      {
        "departamento": "Colonia",
        "nombre": "Laguna De Los Patos"
      },
      {
        "departamento": "Colonia",
        "nombre": "Los Pinos"
      },
      {
        "departamento": "Colonia",
        "nombre": "Miguelete"
      },
      {
        "departamento": "Colonia",
        "nombre": "Nueva Helvecia"
      },
      {
        "departamento": "Colonia",
        "nombre": "Nueva Palmira"
      },
      {
        "departamento": "Colonia",
        "nombre": "Ombues De Lavalle"
      },
      {
        "departamento": "Colonia",
        "nombre": "Paraje Minuano"
      },
      {
        "departamento": "Colonia",
        "nombre": "Paso Antolin"
      },
      {
        "departamento": "Colonia",
        "nombre": "Playa Azul"
      },
      {
        "departamento": "Colonia",
        "nombre": "Playa Britopolis"
      },
      {
        "departamento": "Colonia",
        "nombre": "Playa Fomento"
      },
      {
        "departamento": "Colonia",
        "nombre": "Playa Parant"
      },
      {
        "departamento": "Colonia",
        "nombre": "Pueblo Gil"
      },
      {
        "departamento": "Colonia",
        "nombre": "Puerto Ingles"
      },
      {
        "departamento": "Colonia",
        "nombre": "Radial Hernandez"
      },
      {
        "departamento": "Colonia",
        "nombre": "Riachuelo"
      },
      {
        "departamento": "Colonia",
        "nombre": "Rosario"
      },
      {
        "departamento": "Colonia",
        "nombre": "San Pedro"
      },
      {
        "departamento": "Colonia",
        "nombre": "Santa Ana"
      },
      {
        "departamento": "Colonia",
        "nombre": "Santa Regina"
      },
      {
        "departamento": "Colonia",
        "nombre": "Tarariras"
      },
      {
        "departamento": "Colonia",
        "nombre": "Zagarzazu"
      },
      {
        "departamento": "Durazno",
        "nombre": "Aguas Buenas"
      },
      {
        "departamento": "Durazno",
        "nombre": "Baygorria"
      },
      {
        "departamento": "Durazno",
        "nombre": "Blanquillo"
      },
      {
        "departamento": "Durazno",
        "nombre": "Carlos Reyles"
      },
      {
        "departamento": "Durazno",
        "nombre": "Carmen"
      },
      {
        "departamento": "Durazno",
        "nombre": "Centenario"
      },
      {
        "departamento": "Durazno",
        "nombre": "Cerro Chato"
      },
      {
        "departamento": "Durazno",
        "nombre": "Durazno"
      },
      {
        "departamento": "Durazno",
        "nombre": "Feliciano"
      },
      {
        "departamento": "Durazno",
        "nombre": "La Paloma"
      },
      {
        "departamento": "Durazno",
        "nombre": "Las Palmas"
      },
      {
        "departamento": "Durazno",
        "nombre": "Ombues De Oribe"
      },
      {
        "departamento": "Durazno",
        "nombre": "Pueblo De Alvarez"
      },
      {
        "departamento": "Durazno",
        "nombre": "Rossell Y Rius"
      },
      {
        "departamento": "Durazno",
        "nombre": "San Jorge"
      },
      {
        "departamento": "Durazno",
        "nombre": "Santa Bernardina"
      },
      {
        "departamento": "Durazno",
        "nombre": "Sarandi Del Yi"
      },
      {
        "departamento": "Flores",
        "nombre": "Andresito"
      },
      {
        "departamento": "Flores",
        "nombre": "Cerro Colorado"
      },
      {
        "departamento": "Flores",
        "nombre": "Ismael Cortinas"
      },
      {
        "departamento": "Flores",
        "nombre": "Juan Jose Castro"
      },
      {
        "departamento": "Flores",
        "nombre": "La Casilla"
      },
      {
        "departamento": "Flores",
        "nombre": "Trinidad"
      },
      {
        "departamento": "Florida",
        "nombre": "25 De Agosto"
      },
      {
        "departamento": "Florida",
        "nombre": "25 De Mayo"
      },
      {
        "departamento": "Florida",
        "nombre": "Alejandro Gallinal"
      },
      {
        "departamento": "Florida",
        "nombre": "Berrondo"
      },
      {
        "departamento": "Florida",
        "nombre": "Capilla Del Sauce"
      },
      {
        "departamento": "Florida",
        "nombre": "Cardal"
      },
      {
        "departamento": "Florida",
        "nombre": "Caserio La Fundacion"
      },
      {
        "departamento": "Florida",
        "nombre": "Casupa"
      },
      {
        "departamento": "Florida",
        "nombre": "Cerro Chato"
      },
      {
        "departamento": "Florida",
        "nombre": "Chamizo"
      },
      {
        "departamento": "Florida",
        "nombre": "Estacion Capilla Del Sauce"
      },
      {
        "departamento": "Florida",
        "nombre": "Florida"
      },
      {
        "departamento": "Florida",
        "nombre": "Fray Marcos"
      },
      {
        "departamento": "Florida",
        "nombre": "Goñi"
      },
      {
        "departamento": "Florida",
        "nombre": "Illescas"
      },
      {
        "departamento": "Florida",
        "nombre": "Independencia"
      },
      {
        "departamento": "Florida",
        "nombre": "La Cruz"
      },
      {
        "departamento": "Florida",
        "nombre": "La Macana"
      },
      {
        "departamento": "Florida",
        "nombre": "Mendoza"
      },
      {
        "departamento": "Florida",
        "nombre": "Mendoza Chico"
      },
      {
        "departamento": "Florida",
        "nombre": "Montecoral"
      },
      {
        "departamento": "Florida",
        "nombre": "Nico Perez"
      },
      {
        "departamento": "Florida",
        "nombre": "Pintado"
      },
      {
        "departamento": "Florida",
        "nombre": "Polanco Del Yi"
      },
      {
        "departamento": "Florida",
        "nombre": "Pueblo Ferrer"
      },
      {
        "departamento": "Florida",
        "nombre": "Puntas De Maciel"
      },
      {
        "departamento": "Florida",
        "nombre": "Reboledo"
      },
      {
        "departamento": "Florida",
        "nombre": "San Gabriel"
      },
      {
        "departamento": "Florida",
        "nombre": "Sarandi Grande"
      },
      {
        "departamento": "Florida",
        "nombre": "Valentines"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "19 De Junio"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Aramendia"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Barrio La Coronilla - Ancap"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Blanes Viale"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Colon"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Estacion Solis"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Gaetan"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Illescas"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Jose Batlle Y Ordoñez"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Jose Pedro Varela"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Mariscala"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Minas"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Piraraja"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Polanco Norte"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "San Francisco De Las Sierras"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Solis De Mataojo"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Villa Del Rosario"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Villa Serrana"
      },
      {
        "departamento": "Lavalleja",
        "nombre": "Zapican"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Aigua"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Arenas De Jose Ignacio"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Balneario Buenos Aires"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Barrio Hipodromo"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Bella Vista"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Canteras De Marelli"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Cerro Pelado"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Cerros Azules"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Chihuahua"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Eden Rock"
      },
      {
        "departamento": "Maldonado",
        "nombre": "El Chorro"
      },
      {
        "departamento": "Maldonado",
        "nombre": "El Eden"
      },
      {
        "departamento": "Maldonado",
        "nombre": "El Quijote"
      },
      {
        "departamento": "Maldonado",
        "nombre": "El Tesoro"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Faro Jose Ignacio"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Garzon"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Gerona"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Gregorio Aznarez"
      },
      {
        "departamento": "Maldonado",
        "nombre": "La Barra"
      },
      {
        "departamento": "Maldonado",
        "nombre": "La Capuera"
      },
      {
        "departamento": "Maldonado",
        "nombre": "La Sonrisa"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Laguna Blanca"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Las Cumbres"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Las Flores"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Las Flores - Estacion"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Los Aromos"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Los Corchos"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Los Talas"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Maldonado"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Manantiales"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Nueva Carrara"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Ocean Park"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Pan De Azucar"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Parque Medina"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Pinares - Las Delicias"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Piriapolis"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Playa Grande"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Playa Hermosa"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Playa Verde"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Pueblo Solis"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Punta Ballena"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Punta Colorada"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Punta Del Este"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Punta Negra"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Ruta 37 Y 9"
      },
      {
        "departamento": "Maldonado",
        "nombre": "San Carlos"
      },
      {
        "departamento": "Maldonado",
        "nombre": "San Rafael - El Placer"
      },
      {
        "departamento": "Maldonado",
        "nombre": "San Vicente"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Santa Monica"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Sauce De Portezuelo"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Solis"
      },
      {
        "departamento": "Maldonado",
        "nombre": "Villa Delia"
      },
      {
        "departamento": "Montevideo",
        "nombre": "Montevideo"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Porvenir"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Araujo"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Arbolito"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Beisso"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Bella Vista"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Cañada Del Pueblo"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Casablanca"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Cerro Chato"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Chacras De Paysandú"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Chapicuy"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Constancia"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Cuchilla De Buricayupi"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Cuchilla De Fuego"
      },
      {
        "departamento": "Paysandú",
        "nombre": "El Eucaliptus"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Esperanza"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Estacion Porvenir"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Gallinal"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Guichon"
      },
      {
        "departamento": "Paysandú",
        "nombre": "La Tentacion"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Lorenzo Geyres"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Merinos"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Morato"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Nuevo Paysandú"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Orgoroso"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Paysandú"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Piñera"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Piedra Sola"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Piedras Coloradas"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Pueblo Alonzo"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Pueblo Federacion"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Puntas De Arroyo Negro"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Quebracho"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Queguayar"
      },
      {
        "departamento": "Paysandú",
        "nombre": "San Felix"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Soto"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Tambores"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Termas De Almiron"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Termas De Guaviyu"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Villa Maria (Tiatucura)"
      },
      {
        "departamento": "Paysandú",
        "nombre": "Zeballos"
      },
      {
        "departamento": "Río Negro",
        "nombre": "Algorta"
      },
      {
        "departamento": "Río Negro",
        "nombre": "Barrio Anglo"
      },
      {
        "departamento": "Río Negro",
        "nombre": "Bellaco"
      },
      {
        "departamento": "Río Negro",
        "nombre": "El Ombu"
      },
      {
        "departamento": "Río Negro",
        "nombre": "Fray Bentos"
      },
      {
        "departamento": "Río Negro",
        "nombre": "Grecco"
      },
      {
        "departamento": "Río Negro",
        "nombre": "Las Cañas"
      },
      {
        "departamento": "Río Negro",
        "nombre": "Los Arrayanes"
      },
      {
        "departamento": "Río Negro",
        "nombre": "Menafra"
      },
      {
        "departamento": "Río Negro",
        "nombre": "Merinos"
      },
      {
        "departamento": "Río Negro",
        "nombre": "Nuevo Berlin"
      },
      {
        "departamento": "Río Negro",
        "nombre": "Paso De Los Mellizos"
      },
      {
        "departamento": "Río Negro",
        "nombre": "San Javier"
      },
      {
        "departamento": "Río Negro",
        "nombre": "Sarandi De Navarro"
      },
      {
        "departamento": "Río Negro",
        "nombre": "Tres Quintas"
      },
      {
        "departamento": "Río Negro",
        "nombre": "Villa General Borges"
      },
      {
        "departamento": "Río Negro",
        "nombre": "Villa Maria"
      },
      {
        "departamento": "Río Negro",
        "nombre": "Young"
      },
      {
        "departamento": "Rivera",
        "nombre": "Amarillo"
      },
      {
        "departamento": "Rivera",
        "nombre": "Arroyo Blanco"
      },
      {
        "departamento": "Rivera",
        "nombre": "Cerrillada"
      },
      {
        "departamento": "Rivera",
        "nombre": "Cerro Pelado"
      },
      {
        "departamento": "Rivera",
        "nombre": "Cerros De La Calera"
      },
      {
        "departamento": "Rivera",
        "nombre": "La Pedrera"
      },
      {
        "departamento": "Rivera",
        "nombre": "Lagos Del Norte"
      },
      {
        "departamento": "Rivera",
        "nombre": "Lagunon"
      },
      {
        "departamento": "Rivera",
        "nombre": "Lapuente"
      },
      {
        "departamento": "Rivera",
        "nombre": "Las Flores"
      },
      {
        "departamento": "Rivera",
        "nombre": "Mandubi"
      },
      {
        "departamento": "Rivera",
        "nombre": "Masoller"
      },
      {
        "departamento": "Rivera",
        "nombre": "Minas De Corrales"
      },
      {
        "departamento": "Rivera",
        "nombre": "Moirones"
      },
      {
        "departamento": "Rivera",
        "nombre": "Paso Ataques"
      },
      {
        "departamento": "Rivera",
        "nombre": "Paso Hospital"
      },
      {
        "departamento": "Rivera",
        "nombre": "Rivera"
      },
      {
        "departamento": "Rivera",
        "nombre": "Santa Teresa"
      },
      {
        "departamento": "Rivera",
        "nombre": "Tranqueras"
      },
      {
        "departamento": "Rivera",
        "nombre": "Vichadero"
      },
      {
        "departamento": "Rocha",
        "nombre": "18 De Julio"
      },
      {
        "departamento": "Rocha",
        "nombre": "19 De Abril"
      },
      {
        "departamento": "Rocha",
        "nombre": "Aguas Dulces"
      },
      {
        "departamento": "Rocha",
        "nombre": "Arachania"
      },
      {
        "departamento": "Rocha",
        "nombre": "Barra De Valizas"
      },
      {
        "departamento": "Rocha",
        "nombre": "Barra Del Chuy"
      },
      {
        "departamento": "Rocha",
        "nombre": "Barrio Pereira"
      },
      {
        "departamento": "Rocha",
        "nombre": "Barrio Torres"
      },
      {
        "departamento": "Rocha",
        "nombre": "Cabo Polonio"
      },
      {
        "departamento": "Rocha",
        "nombre": "Capacho"
      },
      {
        "departamento": "Rocha",
        "nombre": "Castillos"
      },
      {
        "departamento": "Rocha",
        "nombre": "Cebollati"
      },
      {
        "departamento": "Rocha",
        "nombre": "Chuy"
      },
      {
        "departamento": "Rocha",
        "nombre": "La Aguada Y Costa Azul"
      },
      {
        "departamento": "Rocha",
        "nombre": "La Coronilla"
      },
      {
        "departamento": "Rocha",
        "nombre": "La Esmeralda"
      },
      {
        "departamento": "Rocha",
        "nombre": "La Paloma"
      },
      {
        "departamento": "Rocha",
        "nombre": "La Pedrera"
      },
      {
        "departamento": "Rocha",
        "nombre": "La Ribiera"
      },
      {
        "departamento": "Rocha",
        "nombre": "Lascano"
      },
      {
        "departamento": "Rocha",
        "nombre": "Oceania Del Polonio"
      },
      {
        "departamento": "Rocha",
        "nombre": "Palmares De La Coronilla"
      },
      {
        "departamento": "Rocha",
        "nombre": "Paralle"
      },
      {
        "departamento": "Rocha",
        "nombre": "Pta. Rubia Y Sta. Isabel De La Ped"
      },
      {
        "departamento": "Rocha",
        "nombre": "Pueblo Nuevo"
      },
      {
        "departamento": "Rocha",
        "nombre": "Puente Valizas"
      },
      {
        "departamento": "Rocha",
        "nombre": "Puerto De Los Botes"
      },
      {
        "departamento": "Rocha",
        "nombre": "Puimayen"
      },
      {
        "departamento": "Rocha",
        "nombre": "Punta Del Diablo"
      },
      {
        "departamento": "Rocha",
        "nombre": "Rocha"
      },
      {
        "departamento": "Rocha",
        "nombre": "San Antonio"
      },
      {
        "departamento": "Rocha",
        "nombre": "San Luis Al Medio"
      },
      {
        "departamento": "Rocha",
        "nombre": "Tajamares De La Pedrera"
      },
      {
        "departamento": "Rocha",
        "nombre": "Velazquez"
      },
      {
        "departamento": "Salto",
        "nombre": "Albisu"
      },
      {
        "departamento": "Salto",
        "nombre": "Arenitas Blancas"
      },
      {
        "departamento": "Salto",
        "nombre": "Belen"
      },
      {
        "departamento": "Salto",
        "nombre": "Biassini"
      },
      {
        "departamento": "Salto",
        "nombre": "Campo De Todos"
      },
      {
        "departamento": "Salto",
        "nombre": "Cayetano"
      },
      {
        "departamento": "Salto",
        "nombre": "Celeste"
      },
      {
        "departamento": "Salto",
        "nombre": "Cerros De Vera"
      },
      {
        "departamento": "Salto",
        "nombre": "Chacras De Belen"
      },
      {
        "departamento": "Salto",
        "nombre": "Colonia 18 De Julio"
      },
      {
        "departamento": "Salto",
        "nombre": "Colonia Itapebi"
      },
      {
        "departamento": "Salto",
        "nombre": "Constitucion"
      },
      {
        "departamento": "Salto",
        "nombre": "Cuchilla De Guaviyu"
      },
      {
        "departamento": "Salto",
        "nombre": "Fernandez"
      },
      {
        "departamento": "Salto",
        "nombre": "Garibaldi"
      },
      {
        "departamento": "Salto",
        "nombre": "Guaviyu De Arapey"
      },
      {
        "departamento": "Salto",
        "nombre": "Las Flores"
      },
      {
        "departamento": "Salto",
        "nombre": "Laureles"
      },
      {
        "departamento": "Salto",
        "nombre": "Lluveras"
      },
      {
        "departamento": "Salto",
        "nombre": "Migliaro"
      },
      {
        "departamento": "Salto",
        "nombre": "Olivera"
      },
      {
        "departamento": "Salto",
        "nombre": "Osimani Y Llerena"
      },
      {
        "departamento": "Salto",
        "nombre": "Palomas"
      },
      {
        "departamento": "Salto",
        "nombre": "Parque Jose Luis"
      },
      {
        "departamento": "Salto",
        "nombre": "Paso Cementerio"
      },
      {
        "departamento": "Salto",
        "nombre": "Paso De Las Piedras De Arerungua"
      },
      {
        "departamento": "Salto",
        "nombre": "Paso Del Parque Del Dayman"
      },
      {
        "departamento": "Salto",
        "nombre": "Puntas De Valentin"
      },
      {
        "departamento": "Salto",
        "nombre": "Quintana"
      },
      {
        "departamento": "Salto",
        "nombre": "Rincon De Valentin"
      },
      {
        "departamento": "Salto",
        "nombre": "Russo"
      },
      {
        "departamento": "Salto",
        "nombre": "Salto"
      },
      {
        "departamento": "Salto",
        "nombre": "San Antonio"
      },
      {
        "departamento": "Salto",
        "nombre": "Sarandi De Arapey"
      },
      {
        "departamento": "Salto",
        "nombre": "Saucedo"
      },
      {
        "departamento": "Salto",
        "nombre": "Termas Del Arapey"
      },
      {
        "departamento": "Salto",
        "nombre": "Termas Del Dayman"
      },
      {
        "departamento": "San José",
        "nombre": "18 De Julio (Pueblo Nuevo)"
      },
      {
        "departamento": "San José",
        "nombre": "Boca Del Cufre"
      },
      {
        "departamento": "San José",
        "nombre": "Cañada Grande"
      },
      {
        "departamento": "San José",
        "nombre": "Capurro"
      },
      {
        "departamento": "San José",
        "nombre": "Carreta Quemada"
      },
      {
        "departamento": "San José",
        "nombre": "Ceramicas Del Sur"
      },
      {
        "departamento": "San José",
        "nombre": "Cololo Tinosa"
      },
      {
        "departamento": "San José",
        "nombre": "Colonia Delta"
      },
      {
        "departamento": "San José",
        "nombre": "Costas De Pereira"
      },
      {
        "departamento": "San José",
        "nombre": "Delta Del Tigre Y Villas"
      },
      {
        "departamento": "San José",
        "nombre": "Ecilda Paullier"
      },
      {
        "departamento": "San José",
        "nombre": "Gonzalez"
      },
      {
        "departamento": "San José",
        "nombre": "Ituzaingo"
      },
      {
        "departamento": "San José",
        "nombre": "Juan Soler"
      },
      {
        "departamento": "San José",
        "nombre": "Kiyu-Ordeig"
      },
      {
        "departamento": "San José",
        "nombre": "La Boyada"
      },
      {
        "departamento": "San José",
        "nombre": "Libertad"
      },
      {
        "departamento": "San José",
        "nombre": "Mal Abrigo"
      },
      {
        "departamento": "San José",
        "nombre": "Mangrullo"
      },
      {
        "departamento": "San José",
        "nombre": "Monte Grande"
      },
      {
        "departamento": "San José",
        "nombre": "Playa Pascual"
      },
      {
        "departamento": "San José",
        "nombre": "Puntas De Valdez"
      },
      {
        "departamento": "San José",
        "nombre": "Radial"
      },
      {
        "departamento": "San José",
        "nombre": "Rafael Peraza"
      },
      {
        "departamento": "San José",
        "nombre": "Raigon"
      },
      {
        "departamento": "San José",
        "nombre": "Rincon Del Pino"
      },
      {
        "departamento": "San José",
        "nombre": "Rodriguez"
      },
      {
        "departamento": "San José",
        "nombre": "Safici (Parque Postel)"
      },
      {
        "departamento": "San José",
        "nombre": "San Gregorio"
      },
      {
        "departamento": "San José",
        "nombre": "San José De Mayo"
      },
      {
        "departamento": "San José",
        "nombre": "Santa Monica"
      },
      {
        "departamento": "San José",
        "nombre": "Scavino"
      },
      {
        "departamento": "San José",
        "nombre": "Villa Maria"
      },
      {
        "departamento": "Soriano",
        "nombre": "Agraciada"
      },
      {
        "departamento": "Soriano",
        "nombre": "Cañada Nieto"
      },
      {
        "departamento": "Soriano",
        "nombre": "Cardona"
      },
      {
        "departamento": "Soriano",
        "nombre": "Castillos"
      },
      {
        "departamento": "Soriano",
        "nombre": "Chacras De Dolores"
      },
      {
        "departamento": "Soriano",
        "nombre": "Colonia Concordia"
      },
      {
        "departamento": "Soriano",
        "nombre": "Cuchilla Del Perdido"
      },
      {
        "departamento": "Soriano",
        "nombre": "Dolores"
      },
      {
        "departamento": "Soriano",
        "nombre": "Egaña"
      },
      {
        "departamento": "Soriano",
        "nombre": "El Tala"
      },
      {
        "departamento": "Soriano",
        "nombre": "Jose Enrique Rodo"
      },
      {
        "departamento": "Soriano",
        "nombre": "La Concordia"
      },
      {
        "departamento": "Soriano",
        "nombre": "La Loma"
      },
      {
        "departamento": "Soriano",
        "nombre": "Lares"
      },
      {
        "departamento": "Soriano",
        "nombre": "Mercedes"
      },
      {
        "departamento": "Soriano",
        "nombre": "Palmar"
      },
      {
        "departamento": "Soriano",
        "nombre": "Palmitas"
      },
      {
        "departamento": "Soriano",
        "nombre": "Palo Solo"
      },
      {
        "departamento": "Soriano",
        "nombre": "Perseverano"
      },
      {
        "departamento": "Soriano",
        "nombre": "Risso"
      },
      {
        "departamento": "Soriano",
        "nombre": "Sacachispas"
      },
      {
        "departamento": "Soriano",
        "nombre": "Santa Catalina"
      },
      {
        "departamento": "Soriano",
        "nombre": "Villa Soriano"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Achar"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Ansina"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Balneario Ipora"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Cardozo"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Cerro De Pastoreo"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Chamberlain"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Clara"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Cruz De Los Caminos"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Cuchilla De Peralta"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Cuchilla Del Ombu"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Curtina"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "La Hilera"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "La Pedrera"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Las Toscas"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Laureles"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Montevideo Chico"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Paso Bonilla"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Paso De Los Toros"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Paso Del Cerro"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Piedra Sola"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Pueblo De Arriba"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Pueblo Del Barro"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Punta De Carretera"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Puntas De Cinco Sauces"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Rincon De Pereira"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Rincon Del Bonete"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "San Gregorio De Polanco"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Sauce De Batovi"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Tacuarembó"
      },
      {
        "departamento": "Tacuarembó",
        "nombre": "Tambores"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Arrocera Bonomo"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Arrocera El Tigre"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Arrocera La Catumbera"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Arrocera La Querencia"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Arrocera Las Palmas"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Arrocera Los Ceibos"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Arrocera Los Teros"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Arrocera Mini"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Arrocera Procipa"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Arrocera Rincon"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Arrocera San Fernando"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Arrocera Santa Fe"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Arrocera Zapata"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Arrozal Treinta y Tress"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Cerro Chato"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Ejido De Treinta y Tress"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "El Bellaco"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Estacion Rincon"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Gral. Enrique Martinez"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Isla Patrulla (Maria Isabel)"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Maria Albina"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Mendizabal (El Oro)"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Poblado Alonzo"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Puntas Del Parao"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Santa Clara De Olimar"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Treinta y Tress"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Valentines"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Vergara"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Villa Passano"
      },
      {
        "departamento": "Treinta y Tres",
        "nombre": "Villa Sara"
      }
    ];

    datos.forEach(localidad => {
      this.db.collection('localidades').add(localidad);
    });
  }

}
