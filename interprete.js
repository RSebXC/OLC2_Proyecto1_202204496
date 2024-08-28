import { Entorno } from "./entorno.js";
import { BaseVisitor } from "./visitor.js";
import nodos, { Expresion } from './nodos.js'
import { BreakException, ContinueException, ReturnException } from "./transferencia.js";
import { Invocable } from "./invocable.js";
import { embebidas } from "./embebidas.js";


export class InterpreterVisitor extends BaseVisitor {

    constructor() {
        super();
        this.entornoActual = new Entorno();

        // funciones embebidas
        Object.entries(embebidas).forEach(([nombre, funcion]) => {
            this.entornoActual.setVariable(nombre, funcion);
        });


        this.salida = '';

        /**
         * @type {Expresion | null}
        */
        this.prevContinue = null;

        // Matriz de compatibilidad de tipos para operaciones
        this.tablaCompatibilidad = {
            '+': {
                'int': { 'int': 'int', 'float': 'float' },
                'float': { 'int': 'float', 'float': 'float' },
                'string': { 'string': 'string' }
            },
            '-': {
                'int': { 'int': 'int', 'float': 'float' },
                'float': { 'int': 'float', 'float': 'float' }
            },
            '*': {
                'int': { 'int': 'int', 'float': 'float' },
                'float': { 'int': 'float', 'float': 'float' }
            },
            '/': {
                'int': { 'int': 'int', 'float': 'float' },
                'float': { 'int': 'float', 'float': 'float' }
            },
            '%': {
                'int': { 'int': 'int' }
            },
            '==': {
                'int': { 'int': 'boolean', 'float': 'boolean' },
                'float': { 'int': 'boolean', 'float': 'boolean' },
                'boolean': { 'boolean': 'boolean' },
                'string': { 'string': 'boolean' },
                'char': { 'char': 'boolean' }
            },
            '!=': {
                'int': { 'int': 'boolean', 'float': 'boolean' },
                'float': { 'int': 'boolean', 'float': 'boolean' },
                'boolean': { 'boolean': 'boolean' },
                'string': { 'string': 'boolean' },
                'char': { 'char': 'boolean' }
            },
            '<=': {
                'int': { 'int': 'boolean', 'float': 'boolean' },
                'float': { 'int': 'boolean', 'float': 'boolean' },
                'char': { 'char': 'boolean' }
            },
            '>=': {
                'int': { 'int': 'boolean', 'float': 'boolean' },
                'float': { 'int': 'boolean', 'float': 'boolean' },
                'char': { 'char': 'boolean' }
            },
            '<': {
                'int': { 'int': 'boolean', 'float': 'boolean' },
                'float': { 'int': 'boolean', 'float': 'boolean' },
                'char': { 'char': 'boolean' }
            },
            '>': {
                'int': { 'int': 'boolean', 'float': 'boolean' },
                'float': { 'int': 'boolean', 'float': 'boolean' },
                'char': { 'char': 'boolean' }
            }
        };

    }

    interpretar(nodo) {
        return nodo.accept(this);
    }

    // Método para determinar el tipo del valor
    obtenerTipo(valor) {
        if (typeof valor === 'number') {
            return Number.isInteger(valor) ? 'int' : 'float';
        }
        if (typeof valor === 'boolean') {
            return 'boolean';
        }
        if (typeof valor === 'object' && valor instanceof Char) { 
            return 'char';
        }
        if (typeof valor === 'string') {
            // Verificar si la cadena es un char (inicia y termina con comillas simples)
            if (valor.length === 3 && valor.startsWith("'") && valor.endsWith("'")) {
                return 'char';
            }
            return 'string';
        }
        throw new Error(`Tipo desconocido: ${valor}`);
    }
    

    // Método para obtener el tipo resultante de una operación
    obtenerTipoResultado(op, tipoIzq, tipoDer) {
        const tiposOp = this.tablaCompatibilidad[op];
        if (!tiposOp) throw new Error(`Operación no soportada: ${op}`);
        const tipoResultado = tiposOp[tipoIzq]?.[tipoDer];
        
        if (!tipoResultado) throw new Error(`Operación ${op} no soportada entre ${tipoIzq} y ${tipoDer}`);
        return tipoResultado;
    }

    /**
      * @type {BaseVisitor['visitOperacionBinaria']}
      */
    visitOperacionBinaria(node) {
        const izq = node.izq.accept(this);
        const der = node.der.accept(this);
        const tipoIzq = this.obtenerTipo(izq);
        const tipoDer = this.obtenerTipo(der);
        const tipoResultado = this.obtenerTipoResultado(node.op, tipoIzq, tipoDer);

        switch (node.op) {
            case '+':
            case '-':
            case '*':
            case '/':
            case '%':
            case '==':
            case '!=':
            case '<=':
            case '>=':
            case '<':
            case '>':
                return eval(`${izq} ${node.op} ${der}`);
            default:
                throw new Error(`Operador no soportado: ${node.op}`);
        }
    }

    /**
      * @type {BaseVisitor['visitOperacionUnaria']}
      */
    visitOperacionUnaria(node) {
        const exp = node.exp.accept(this);

        switch (node.op) {
            case '-':
                return -exp;
            default:
                throw new Error(`Operador no soportado: ${node.op}`);
        }
    }

    /**
      * @type {BaseVisitor['visitAgrupacion']}
      */
    visitAgrupacion(node) {
        return node.exp.accept(this);
    }

    /**
 * @type {BaseVisitor['visitDato']}
 */
visitDato(node) {
    if (node.tipo === 'string') {
        return node.valor.replace(/\\(.)/g, (_, char) => {
            switch (char) {
                case '"': return '"';
                case '\\': return '\\';
                case 'n': return '\n';
                case 'r': return '\r';
                case 't': return '\t';
                default: throw new Error(`Secuencia de escape no reconocida: \\${char}`);
            }
        });
    }
    if (node.tipo === 'char') {
        // Mantener las comillas alrededor de los caracteres
        return `'${node.valor.replace(/\\(.)/g, (_, char) => {
            switch (char) {
                case "'": return "'";
                case '\\': return '\\';
                case 'n': return '\n';
                case 'r': return '\r';
                case 't': return '\t';
                default: throw new Error(`Secuencia de escape no reconocida: \\${char}`);
            }
        })}'`;
    }
    return node.valor;
}




    /**
     * @type {BaseVisitor['visitDeclaracionVariable']}
     */
    visitDeclaracionVariable(node) {
        const nombreVariable = node.id;
        const valorVariable = node.exp.accept(this);

        this.entornoActual.setVariable(nombreVariable, valorVariable);
    }


    /**
      * @type {BaseVisitor['visitReferenciaVariable']}
      */
    visitReferenciaVariable(node) {
        const nombreVariable = node.id;
        return this.entornoActual.getVariable(nombreVariable);
    }


    /**
      * @type {BaseVisitor['visitPrint']}
      */
    visitPrint(node) {
        const valor = node.exp.accept(this);
        this.salida += valor + '\n';
    }


    /**
      * @type {BaseVisitor['visitExpresionStmt']}
      */
    visitExpresionStmt(node) {
        node.exp.accept(this);
    }

    /**
     * @type {BaseVisitor['visitAsignacion']}
     */
    visitAsignacion(node) {
        // const valor = this.interpretar(node.asgn);
        const valor = node.asgn.accept(this);
        this.entornoActual.assignVariable(node.id, valor);

        return valor;
    }

    /**
     * @type {BaseVisitor['visitBloque']}
     */
    visitBloque(node) {

        const entornoAnterior = this.entornoActual;
        this.entornoActual = new Entorno(entornoAnterior);

        node.dcls.forEach(dcl => dcl.accept(this));

        this.entornoActual = entornoAnterior;
    }

    /**
     * @type {BaseVisitor['visitIf']}
     */
    visitIf(node) {
        const cond = node.cond.accept(this);

        if (cond) {
            node.stmtTrue.accept(this);
            return;
        }

        if (node.stmtFalse) {
            node.stmtFalse.accept(this);
        }

    }

    /**
     * @type {BaseVisitor['visitWhile']}
     */
    visitWhile(node) {
        const entornoConElQueEmpezo = this.entornoActual;

        try {
            while (node.cond.accept(this)) {
                node.stmt.accept(this);
            }
        } catch (error) {
            this.entornoActual = entornoConElQueEmpezo;

            if (error instanceof BreakException) {
                console.log('break');
                return
            }

            if (error instanceof ContinueException) {
                return this.visitWhile(node);
            }

            throw error;

        }
    }

    /**
     * @type {BaseVisitor['visitFor']}
     */
    visitFor(node) {
        // this.prevContinue = node.inc;
        const incrementoAnterior = this.prevContinue;
        this.prevContinue = node.inc;

        const forTraducido = new nodos.Bloque({
            dcls: [
                node.init,
                new nodos.While({
                    cond: node.cond,
                    stmt: new nodos.Bloque({
                        dcls: [
                            node.stmt,
                            node.inc
                        ]
                    })
                })
            ]
        })

        forTraducido.accept(this);

        this.prevContinue = incrementoAnterior;
    }

    /**
     * @type {BaseVisitor['visitBreak']}
     */
    visitBreak(node) {
        throw new BreakException();
    }

    /**
     * @type {BaseVisitor['visitContinue']}
     */
    visitContinue(node) {

        if (this.prevContinue) {
            this.prevContinue.accept(this);
        }

        throw new ContinueException();
    }

    /**
     * @type {BaseVisitor['visitReturn']}
     */
    visitReturn(node) {
        let valor = null
        if (node.exp) {
            valor = node.exp.accept(this);
        }
        throw new ReturnException(valor);
    }

    /**
    * @type {BaseVisitor['visitLlamada']}
    */
    visitLlamada(node) {
        const funcion = node.callee.accept(this);

        const argumentos = node.args.map(arg => arg.accept(this));

        if (!(funcion instanceof Invocable)) {
            throw new Error('No es invocable');
            // 1() "sdalsk"()
        }

        if (funcion.aridad() !== argumentos.length) {
            throw new Error('Aridad incorrecta');
        }

        return funcion.invocar(this, argumentos);
    }

}