import { Posicion } from '../../shared/interfaces/datosMapa.interface';


export interface Lugar {
    id?: string;
    publicado: boolean;
    departamento: Departamento;
    auto?: boolean;
    bicicleta?: boolean;
    caminar?: boolean;
    patrimonial?: boolean;
    accesibilidad?: boolean;
    descripcion?: string;
    imagenHome?: string;
    facebook?: string;
    imagenPrincipal?: string;
    instagram?: string;
    ubicacion: Posicion;
    nombre: string;
    tipo: LugarTipo;
    imagenes?: Imagen[];
    valoraciones?: Valoracion[];
    videos?: Video[];
    web?: string;
    whatsapp?: string;
    telefonos?: string[];
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