import { Posicion } from '../../shared/interfaces/datosMapa.interface';


export interface Lugar {
    accesibilidad?: boolean;
    auto?: boolean;
    bicicleta?: boolean;
    caminar?: boolean;
    departamento: DepartamentoEnum;
    descripcion?: string;
    facebook?: string;
    id?: string;
    imagenHome?: Imagen;
    imagenPrincipal?: Imagen;
    imagenes?: Imagen[];
    instagram?: string;
    localidad: string;
    nombre: string;
    patrimonial: boolean;
    prioridad: number;
    publicado: boolean;
    telefonos?: string[];
    tipo: LugarTipo;
    ubicacion: Posicion;
    valoraciones?: Valoracion[];
    videos?: string[];
    web?: string;
    whatsapp?: string;
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

export enum DepartamentoEnum {
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