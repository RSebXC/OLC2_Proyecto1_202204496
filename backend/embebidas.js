import { Invocable } from "./Invocable.js";


class FuncionNativa extends Invocable {
    constructor(aridad, func) {
        super();
        this.aridad = aridad;
        this.invocar = func;
    }
}


export const embebidas = {
    'time': new FuncionNativa(() => 0, () => new Date().toISOString()),
    'Object.keys': new FuncionNativa(() => 1, (interprete, args) => {
        console.log(args[0]);
        if (args[0].tipo !== 'object') {
            throw new Error('El argumento de Object.keys debe ser un objeto');
        }
        return { valor: Object.keys(args[0].valor), tipo: 'array'};
})
}