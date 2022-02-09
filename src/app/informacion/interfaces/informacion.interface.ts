
export interface Informacion{
    categoria:string;
    datos: DataInfo[];
    departamento: string;
    id?:string;
    localidad: string;
    publicado: boolean;
}

export interface DataInfo{
    nombre: string;
    telefono: string;
}