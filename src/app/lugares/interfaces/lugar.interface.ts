import { Posicion } from '../../shared/interfaces/datosMapa.interface';
import { Localidad } from '../../shared/interfaces/localidad.interface';


export interface Lugar {
    id?: string;
    nombre: string;
    publicado: boolean;
    departamento: Departamento;
    localidad: Localidad;
    auto?: boolean;
    bicicleta?: boolean;
    caminar?: boolean;
    patrimonial?: boolean;
    accesibilidad?: boolean;
    descripcion?: string;
    imagenHome?: Imagen;
    imagenPrincipal?: Imagen;
    ubicacion: Posicion;
    tipo: LugarTipo;
    imagenes?: Imagen[];
    facebook?: string;
    instagram?: string;
    web?: string;
    whatsapp?: string;
    telefonos?: string[];
    valoraciones?: Valoracion[];
    videos?: string[];
}

export interface Imagen {
    name: string;
    url: string;
}

export interface Valoracion {
    usuario: string;
    valor: number;
}

export interface Video {
    name: string;
    url: string;
}

export enum LugarTipo {
    urbano = 'Urbano',
    rural = 'Rural',
}

export enum Departamento {
    artigas = "Artigas",
    canelones = "Canelones",
    cerroLargo = "Cerro Largo",
    colonia = "Colonia",
    durazno = "Durazno",
    flores = "Flores",
    florida = "Florida",
    lavalleja = "Lavalleja",
    maldonado = "Maldonado",
    montevideo = "Montevideo",
    paysandu = "Paysandú",
    rioNegro = "Río Negro",
    rivera = "Rivera",
    rocha = "Rocha",
    salto = "Salto",
    sanJose = "San José",
    soriano = "Soriano",
    tacuarembo = "Tacuarembó",
    treintaYTres = "Treinta y Tres"
}