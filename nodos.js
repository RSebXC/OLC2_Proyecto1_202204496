
/**
 * @typedef {Object} Location
 * @property {Object} start
 * @property {number} start.offset
 * @property {number} start.line
 * @property {number} start.column
 * @property {Object} end
 * @property {number} end.offset
 * @property {number} end.line
 * @property {number} end.column
*/
    

/**
 * @typedef {import('./visitor').BaseVisitor} BaseVisitor
 */

export class Expresion  {

    /**
    * @param {Object} options
    * @param {Location|null} options.location Ubicacion del nodo en el codigo fuente
    */
    constructor() {
        
        
        /**
         * Ubicacion del nodo en el codigo fuente
         * @type {Location|null}
        */
        this.location = null;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitExpresion(this);
    }
}
    
export class OperacionBinaria extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.izq Expresion izquierda de la operacion
 * @param {Expresion} options.der Expresion derecha de la operacion
 * @param {string} options.op Operador de la operacion
    */
    constructor({ izq, der, op }) {
        super();
        
        /**
         * Expresion izquierda de la operacion
         * @type {Expresion}
        */
        this.izq = izq;


        /**
         * Expresion derecha de la operacion
         * @type {Expresion}
        */
        this.der = der;


        /**
         * Operador de la operacion
         * @type {string}
        */
        this.op = op;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitOperacionBinaria(this);
    }
}
    
export class OperacionUnaria extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion de la operacion
 * @param {string} options.op Operador de la operacion
    */
    constructor({ exp, op }) {
        super();
        
        /**
         * Expresion de la operacion
         * @type {Expresion}
        */
        this.exp = exp;


        /**
         * Operador de la operacion
         * @type {string}
        */
        this.op = op;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitOperacionUnaria(this);
    }
}
    
export class Agrupacion extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion agrupada
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion agrupada
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitAgrupacion(this);
    }
}
    
export class Dato extends Expresion {

    /**
    * @param {Object} options
    * @param {any} options.valor Valor del numero
 * @param {string} options.tipo Tipo del dato
    */
    constructor({ valor, tipo }) {
        super();
        
        /**
         * Valor del numero
         * @type {any}
        */
        this.valor = valor;


        /**
         * Tipo del dato
         * @type {string}
        */
        this.tipo = tipo;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitDato(this);
    }
}
    
export class DeclaracionVariable extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador de la variable
 * @param {Expresion} options.exp Expresion de la variable
 * @param {string} options.tipo tipo de la variable
    */
    constructor({ id, exp, tipo }) {
        super();
        
        /**
         * Identificador de la variable
         * @type {string}
        */
        this.id = id;


        /**
         * Expresion de la variable
         * @type {Expresion}
        */
        this.exp = exp;


        /**
         * tipo de la variable
         * @type {string}
        */
        this.tipo = tipo;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitDeclaracionVariable(this);
    }
}
    
export class ReferenciaVariable extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador de la variable
    */
    constructor({ id }) {
        super();
        
        /**
         * Identificador de la variable
         * @type {string}
        */
        this.id = id;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitReferenciaVariable(this);
    }
}
    
export class Print extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion a imprimir
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion a imprimir
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitPrint(this);
    }
}
    
export class ExpresionStmt extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion a evaluar
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion a evaluar
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitExpresionStmt(this);
    }
}
    
export class DeclaracionArray extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador del array
 * @param {Expresion} options.tipo Tipo de los elementos del array
 * @param {Expresion} options.tipoArray Tipo del array (para la declaración con new)
 * @param {Expresion} options.tamano Tamaño del array (para la declaración con new)
 * @param {arrayLiteral} options.array Elementos del array (para la declaración con valores literales)
    */
    constructor({ id, tipo, tipoArray, tamano, array }) {
        super();
        
        /**
         * Identificador del array
         * @type {string}
        */
        this.id = id;


        /**
         * Tipo de los elementos del array
         * @type {Expresion}
        */
        this.tipo = tipo;


        /**
         * Tipo del array (para la declaración con new)
         * @type {Expresion}
        */
        this.tipoArray = tipoArray;


        /**
         * Tamaño del array (para la declaración con new)
         * @type {Expresion}
        */
        this.tamano = tamano;


        /**
         * Elementos del array (para la declaración con valores literales)
         * @type {arrayLiteral}
        */
        this.array = array;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitDeclaracionArray(this);
    }
}
    
export class arrayLiteral extends Expresion {

    /**
    * @param {Object} options
    * @param {Array<Expresion>} options.elems Elementos del array
    */
    constructor({ elems }) {
        super();
        
        /**
         * Elementos del array
         * @type {Array<Expresion>}
        */
        this.elems = elems;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitarrayLiteral(this);
    }
}
    
export class AsignacionArray extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador del array que recibe la asignación
 * @param {string} options.source Identificador del array fuente
 * @param {Expresion} options.tipo Tipo de los elementos del array
    */
    constructor({ id, source, tipo }) {
        super();
        
        /**
         * Identificador del array que recibe la asignación
         * @type {string}
        */
        this.id = id;


        /**
         * Identificador del array fuente
         * @type {string}
        */
        this.source = source;


        /**
         * Tipo de los elementos del array
         * @type {Expresion}
        */
        this.tipo = tipo;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitAsignacionArray(this);
    }
}
    
export class IndexOf extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.array Identificador del array
 * @param {Expresion} options.elem Elemento a buscar en el array
    */
    constructor({ array, elem }) {
        super();
        
        /**
         * Identificador del array
         * @type {string}
        */
        this.array = array;


        /**
         * Elemento a buscar en el array
         * @type {Expresion}
        */
        this.elem = elem;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitIndexOf(this);
    }
}
    
export class Join extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.array Identificador del array
    */
    constructor({ array }) {
        super();
        
        /**
         * Identificador del array
         * @type {string}
        */
        this.array = array;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitJoin(this);
    }
}
    
export class Length extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.array Identificador del array
    */
    constructor({ array }) {
        super();
        
        /**
         * Identificador del array
         * @type {string}
        */
        this.array = array;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitLength(this);
    }
}
    
export class ArrayAccess extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.array Identificador del array
 * @param {Expresion} options.index Índice del elemento
    */
    constructor({ array, index }) {
        super();
        
        /**
         * Identificador del array
         * @type {string}
        */
        this.array = array;


        /**
         * Índice del elemento
         * @type {Expresion}
        */
        this.index = index;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitArrayAccess(this);
    }
}
    
export class ArrayAssignment extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.array Identificador del array
 * @param {Expresion} options.index Índice del elemento
 * @param {Expresion} options.valor Nuevo valor para asignar
    */
    constructor({ array, index, valor }) {
        super();
        
        /**
         * Identificador del array
         * @type {string}
        */
        this.array = array;


        /**
         * Índice del elemento
         * @type {Expresion}
        */
        this.index = index;


        /**
         * Nuevo valor para asignar
         * @type {Expresion}
        */
        this.valor = valor;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitArrayAssignment(this);
    }
}
    
export class Asignacion extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador de la variable
 * @param {Expresion} options.asgn Expresion a asignar
 * @param {string} options.op Operador de asignacion
    */
    constructor({ id, asgn, op }) {
        super();
        
        /**
         * Identificador de la variable
         * @type {string}
        */
        this.id = id;


        /**
         * Expresion a asignar
         * @type {Expresion}
        */
        this.asgn = asgn;


        /**
         * Operador de asignacion
         * @type {string}
        */
        this.op = op;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitAsignacion(this);
    }
}
    
export class Switch extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.expr Expresion a evaluar
 * @param {Expresion[]} options.cases Casos del switch
 * @param {Expresion} options.defaultCase Caso por defecto
    */
    constructor({ expr, cases, defaultCase }) {
        super();
        
        /**
         * Expresion a evaluar
         * @type {Expresion}
        */
        this.expr = expr;


        /**
         * Casos del switch
         * @type {Expresion[]}
        */
        this.cases = cases;


        /**
         * Caso por defecto
         * @type {Expresion}
        */
        this.defaultCase = defaultCase;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitSwitch(this);
    }
}
    
export class ParseInt extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion a evaluar
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion a evaluar
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitParseInt(this);
    }
}
    
export class ParseFloat extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion a evaluar
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion a evaluar
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitParseFloat(this);
    }
}
    
export class ToString extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion a evaluar
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion a evaluar
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitToString(this);
    }
}
    
export class ToLowerCase extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion a evaluar
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion a evaluar
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitToLowerCase(this);
    }
}
    
export class ToUpperCase extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion a evaluar
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion a evaluar
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitToUpperCase(this);
    }
}
    
export class TypeOf extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.exp Expresion a evaluar
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion a evaluar
         * @type {Expresion}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitTypeOf(this);
    }
}
    
export class Bloque extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion[]} options.dcls Sentencias del bloque
    */
    constructor({ dcls }) {
        super();
        
        /**
         * Sentencias del bloque
         * @type {Expresion[]}
        */
        this.dcls = dcls;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitBloque(this);
    }
}
    
export class If extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.cond Condicion del if
 * @param {Expresion} options.stmtTrue Cuerpo del if
 * @param {Expresion|undefined} options.stmtFalse Cuerpo del else
    */
    constructor({ cond, stmtTrue, stmtFalse }) {
        super();
        
        /**
         * Condicion del if
         * @type {Expresion}
        */
        this.cond = cond;


        /**
         * Cuerpo del if
         * @type {Expresion}
        */
        this.stmtTrue = stmtTrue;


        /**
         * Cuerpo del else
         * @type {Expresion|undefined}
        */
        this.stmtFalse = stmtFalse;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitIf(this);
    }
}
    
export class While extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.cond Condicion del while
 * @param {Expresion} options.stmt Cuerpo del while
    */
    constructor({ cond, stmt }) {
        super();
        
        /**
         * Condicion del while
         * @type {Expresion}
        */
        this.cond = cond;


        /**
         * Cuerpo del while
         * @type {Expresion}
        */
        this.stmt = stmt;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitWhile(this);
    }
}
    
export class For extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.init Inicializacion del for
 * @param {Expresion} options.cond Condicion del for
 * @param {Expresion} options.inc Incremento del for
 * @param {Expresion} options.stmt Cuerpo del for
    */
    constructor({ init, cond, inc, stmt }) {
        super();
        
        /**
         * Inicializacion del for
         * @type {Expresion}
        */
        this.init = init;


        /**
         * Condicion del for
         * @type {Expresion}
        */
        this.cond = cond;


        /**
         * Incremento del for
         * @type {Expresion}
        */
        this.inc = inc;


        /**
         * Cuerpo del for
         * @type {Expresion}
        */
        this.stmt = stmt;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitFor(this);
    }
}
    
export class Break extends Expresion {

    /**
    * @param {Object} options
    * 
    */
    constructor() {
        super();
        
    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitBreak(this);
    }
}
    
export class Continue extends Expresion {

    /**
    * @param {Object} options
    * 
    */
    constructor() {
        super();
        
    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitContinue(this);
    }
}
    
export class Return extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion|undefined} options.exp Expresion a retornar
    */
    constructor({ exp }) {
        super();
        
        /**
         * Expresion a retornar
         * @type {Expresion|undefined}
        */
        this.exp = exp;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitReturn(this);
    }
}
    
export class Llamada extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.callee Expresion a llamar
 * @param {Expresion[]} options.args Argumentos de la llamada
    */
    constructor({ callee, args }) {
        super();
        
        /**
         * Expresion a llamar
         * @type {Expresion}
        */
        this.callee = callee;


        /**
         * Argumentos de la llamada
         * @type {Expresion[]}
        */
        this.args = args;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitLlamada(this);
    }
}
    
export class FuncDcl extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador de la funcion
 * @param {Array<{tipo: string, id: string}>} options.params Parametros de la funcion
 * @param {Bloque} options.bloque Cuerpo de la funcion
    */
    constructor({ id, params, bloque }) {
        super();
        
        /**
         * Identificador de la funcion
         * @type {string}
        */
        this.id = id;


        /**
         * Parametros de la funcion
         * @type {Array<{tipo: string, id: string}>}
        */
        this.params = params;


        /**
         * Cuerpo de la funcion
         * @type {Bloque}
        */
        this.bloque = bloque;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitFuncDcl(this);
    }
}
    
export class ClassDcl extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador del struct
 * @param {Expresion[]} options.dcls Declaraciones del struct
    */
    constructor({ id, dcls }) {
        super();
        
        /**
         * Identificador del struct
         * @type {string}
        */
        this.id = id;


        /**
         * Declaraciones del struct
         * @type {Expresion[]}
        */
        this.dcls = dcls;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitClassDcl(this);
    }
}
    
export class Instancia extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador de la clase
 * @param {Expresion[]} options.args Argumentos de la instancia
    */
    constructor({ id, args }) {
        super();
        
        /**
         * Identificador de la clase
         * @type {string}
        */
        this.id = id;


        /**
         * Argumentos de la instancia
         * @type {Expresion[]}
        */
        this.args = args;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitInstancia(this);
    }
}
    
export class Get extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.objetivo Objeto de la propiedad
 * @param {string} options.propiedad Identificador de la propiedad
    */
    constructor({ objetivo, propiedad }) {
        super();
        
        /**
         * Objeto de la propiedad
         * @type {Expresion}
        */
        this.objetivo = objetivo;


        /**
         * Identificador de la propiedad
         * @type {string}
        */
        this.propiedad = propiedad;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitGet(this);
    }
}
    
export class Set extends Expresion {

    /**
    * @param {Object} options
    * @param {Expresion} options.objetivo Objeto de la propiedad
 * @param {string} options.propiedad Identificador de la propiedad
 * @param {Expresion} options.valor Valor de la propiedad
    */
    constructor({ objetivo, propiedad, valor }) {
        super();
        
        /**
         * Objeto de la propiedad
         * @type {Expresion}
        */
        this.objetivo = objetivo;


        /**
         * Identificador de la propiedad
         * @type {string}
        */
        this.propiedad = propiedad;


        /**
         * Valor de la propiedad
         * @type {Expresion}
        */
        this.valor = valor;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitSet(this);
    }
}
    
export class MatrixDeclaracion extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.id Identificador de la matriz
 * @param {Tipos} options.tipo Tipo de los elementos de la matriz
 * @param {FormasMatrix} options.valores Valores iniciales de la matriz o declaración con tamaños
 * @param {number | Array<Expresion>} options.size Tamaños de las dimensiones de la matriz
    */
    constructor({ id, tipo, valores, size }) {
        super();
        
        /**
         * Identificador de la matriz
         * @type {string}
        */
        this.id = id;


        /**
         * Tipo de los elementos de la matriz
         * @type {Tipos}
        */
        this.tipo = tipo;


        /**
         * Valores iniciales de la matriz o declaración con tamaños
         * @type {FormasMatrix}
        */
        this.valores = valores;


        /**
         * Tamaños de las dimensiones de la matriz
         * @type {number | Array<Expresion>}
        */
        this.size = size;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitMatrixDeclaracion(this);
    }
}
    
export class AsignacionMatriz extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.array Identificador de la matriz
 * @param {Expresion[]} options.indices Indices de la matriz
 * @param {Expresion} options.valor Valor a asignar
    */
    constructor({ array, indices, valor }) {
        super();
        
        /**
         * Identificador de la matriz
         * @type {string}
        */
        this.array = array;


        /**
         * Indices de la matriz
         * @type {Expresion[]}
        */
        this.indices = indices;


        /**
         * Valor a asignar
         * @type {Expresion}
        */
        this.valor = valor;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitAsignacionMatriz(this);
    }
}
    
export class AccesoMatriz extends Expresion {

    /**
    * @param {Object} options
    * @param {string} options.array Identificador de la matriz
 * @param {Expresion[]} options.indices Indices de la matriz
    */
    constructor({ array, indices }) {
        super();
        
        /**
         * Identificador de la matriz
         * @type {string}
        */
        this.array = array;


        /**
         * Indices de la matriz
         * @type {Expresion[]}
        */
        this.indices = indices;

    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visitAccesoMatriz(this);
    }
}
    
export default { Expresion, OperacionBinaria, OperacionUnaria, Agrupacion, Dato, DeclaracionVariable, ReferenciaVariable, Print, ExpresionStmt, DeclaracionArray, arrayLiteral, AsignacionArray, IndexOf, Join, Length, ArrayAccess, ArrayAssignment, Asignacion, Switch, ParseInt, ParseFloat, ToString, ToLowerCase, ToUpperCase, TypeOf, Bloque, If, While, For, Break, Continue, Return, Llamada, FuncDcl, ClassDcl, Instancia, Get, Set, MatrixDeclaracion, AsignacionMatriz, AccesoMatriz }
