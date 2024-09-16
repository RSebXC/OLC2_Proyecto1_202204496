import { InterpreterVisitor } from "./interprete.js";

export class Invocable {


    aridad() {
        throw new Error('No implementado');
    }

    /**
     * @param interprete {InterpreterVisitor}
     * @param args {any[]}
     */
    /**
* @type {Invocable['invocar']}
*/
/**
 * @type {Invocable['invocar']}
 */
invocar(interprete, args) {
    const entornoNuevo = new Entorno(this.clousure);

    this.nodo.params.forEach((param, i) => {
        // Cambiar de entornoNuevo.set a entornoNuevo.setVariable
        entornoNuevo.setVariable(param.id, { tipo: param.tipo, valor: args[i] });
    });

    const entornoAntesDeLaLlamada = interprete.entornoActual;
    interprete.entornoActual = entornoNuevo;

    try {
        this.nodo.bloque.accept(interprete);
    } catch (error) {
        interprete.entornoActual = entornoAntesDeLaLlamada;

        if (error instanceof ReturnException) {
            return error.value;
        }

        // TODO: manejar el resto de sentencias de control
        throw error;
    }

    interprete.entornoActual = entornoAntesDeLaLlamada;
    return null;
}


}