
/**

 * @typedef {import('./nodos').Expresion} Expresion


 * @typedef {import('./nodos').OperacionBinaria} OperacionBinaria


 * @typedef {import('./nodos').OperacionUnaria} OperacionUnaria


 * @typedef {import('./nodos').Agrupacion} Agrupacion


 * @typedef {import('./nodos').Dato} Dato


 * @typedef {import('./nodos').DeclaracionVariable} DeclaracionVariable


 * @typedef {import('./nodos').ReferenciaVariable} ReferenciaVariable


 * @typedef {import('./nodos').Print} Print


 * @typedef {import('./nodos').ExpresionStmt} ExpresionStmt


 * @typedef {import('./nodos').DeclaracionArray} DeclaracionArray


 * @typedef {import('./nodos').arrayLiteral} arrayLiteral


 * @typedef {import('./nodos').AsignacionArray} AsignacionArray


 * @typedef {import('./nodos').IndexOf} IndexOf


 * @typedef {import('./nodos').Join} Join


 * @typedef {import('./nodos').Length} Length


 * @typedef {import('./nodos').ArrayAccess} ArrayAccess


 * @typedef {import('./nodos').ArrayAssignment} ArrayAssignment


 * @typedef {import('./nodos').Asignacion} Asignacion


 * @typedef {import('./nodos').Switch} Switch


 * @typedef {import('./nodos').ParseInt} ParseInt


 * @typedef {import('./nodos').ParseFloat} ParseFloat


 * @typedef {import('./nodos').ToString} ToString


 * @typedef {import('./nodos').ToLowerCase} ToLowerCase


 * @typedef {import('./nodos').ToUpperCase} ToUpperCase


 * @typedef {import('./nodos').TypeOf} TypeOf


 * @typedef {import('./nodos').Bloque} Bloque


 * @typedef {import('./nodos').If} If


 * @typedef {import('./nodos').While} While


 * @typedef {import('./nodos').For} For


 * @typedef {import('./nodos').Break} Break


 * @typedef {import('./nodos').Continue} Continue


 * @typedef {import('./nodos').Return} Return


 * @typedef {import('./nodos').Llamada} Llamada


 * @typedef {import('./nodos').FuncDcl} FuncDcl


 * @typedef {import('./nodos').ClassDcl} ClassDcl


 * @typedef {import('./nodos').InstanciaStruct} InstanciaStruct


 * @typedef {import('./nodos').Instancia} Instancia


 * @typedef {import('./nodos').Get} Get


 * @typedef {import('./nodos').Set} Set


 * @typedef {import('./nodos').MatrixDeclaracion} MatrixDeclaracion


 * @typedef {import('./nodos').AsignacionMatriz} AsignacionMatriz


 * @typedef {import('./nodos').AccesoMatriz} AccesoMatriz

 */


/**
 * Clase base para los visitantes
 * @abstract
 */
export class BaseVisitor {

    
    /**
     * @param {Expresion} node
     * @returns {any}
     */
    visitExpresion(node) {
        throw new Error('Metodo visitExpresion no implementado');
    }
    

    /**
     * @param {OperacionBinaria} node
     * @returns {any}
     */
    visitOperacionBinaria(node) {
        throw new Error('Metodo visitOperacionBinaria no implementado');
    }
    

    /**
     * @param {OperacionUnaria} node
     * @returns {any}
     */
    visitOperacionUnaria(node) {
        throw new Error('Metodo visitOperacionUnaria no implementado');
    }
    

    /**
     * @param {Agrupacion} node
     * @returns {any}
     */
    visitAgrupacion(node) {
        throw new Error('Metodo visitAgrupacion no implementado');
    }
    

    /**
     * @param {Dato} node
     * @returns {any}
     */
    visitDato(node) {
        throw new Error('Metodo visitDato no implementado');
    }
    

    /**
     * @param {DeclaracionVariable} node
     * @returns {any}
     */
    visitDeclaracionVariable(node) {
        throw new Error('Metodo visitDeclaracionVariable no implementado');
    }
    

    /**
     * @param {ReferenciaVariable} node
     * @returns {any}
     */
    visitReferenciaVariable(node) {
        throw new Error('Metodo visitReferenciaVariable no implementado');
    }
    

    /**
     * @param {Print} node
     * @returns {any}
     */
    visitPrint(node) {
        throw new Error('Metodo visitPrint no implementado');
    }
    

    /**
     * @param {ExpresionStmt} node
     * @returns {any}
     */
    visitExpresionStmt(node) {
        throw new Error('Metodo visitExpresionStmt no implementado');
    }
    

    /**
     * @param {DeclaracionArray} node
     * @returns {any}
     */
    visitDeclaracionArray(node) {
        throw new Error('Metodo visitDeclaracionArray no implementado');
    }
    

    /**
     * @param {arrayLiteral} node
     * @returns {any}
     */
    visitarrayLiteral(node) {
        throw new Error('Metodo visitarrayLiteral no implementado');
    }
    

    /**
     * @param {AsignacionArray} node
     * @returns {any}
     */
    visitAsignacionArray(node) {
        throw new Error('Metodo visitAsignacionArray no implementado');
    }
    

    /**
     * @param {IndexOf} node
     * @returns {any}
     */
    visitIndexOf(node) {
        throw new Error('Metodo visitIndexOf no implementado');
    }
    

    /**
     * @param {Join} node
     * @returns {any}
     */
    visitJoin(node) {
        throw new Error('Metodo visitJoin no implementado');
    }
    

    /**
     * @param {Length} node
     * @returns {any}
     */
    visitLength(node) {
        throw new Error('Metodo visitLength no implementado');
    }
    

    /**
     * @param {ArrayAccess} node
     * @returns {any}
     */
    visitArrayAccess(node) {
        throw new Error('Metodo visitArrayAccess no implementado');
    }
    

    /**
     * @param {ArrayAssignment} node
     * @returns {any}
     */
    visitArrayAssignment(node) {
        throw new Error('Metodo visitArrayAssignment no implementado');
    }
    

    /**
     * @param {Asignacion} node
     * @returns {any}
     */
    visitAsignacion(node) {
        throw new Error('Metodo visitAsignacion no implementado');
    }
    

    /**
     * @param {Switch} node
     * @returns {any}
     */
    visitSwitch(node) {
        throw new Error('Metodo visitSwitch no implementado');
    }
    

    /**
     * @param {ParseInt} node
     * @returns {any}
     */
    visitParseInt(node) {
        throw new Error('Metodo visitParseInt no implementado');
    }
    

    /**
     * @param {ParseFloat} node
     * @returns {any}
     */
    visitParseFloat(node) {
        throw new Error('Metodo visitParseFloat no implementado');
    }
    

    /**
     * @param {ToString} node
     * @returns {any}
     */
    visitToString(node) {
        throw new Error('Metodo visitToString no implementado');
    }
    

    /**
     * @param {ToLowerCase} node
     * @returns {any}
     */
    visitToLowerCase(node) {
        throw new Error('Metodo visitToLowerCase no implementado');
    }
    

    /**
     * @param {ToUpperCase} node
     * @returns {any}
     */
    visitToUpperCase(node) {
        throw new Error('Metodo visitToUpperCase no implementado');
    }
    

    /**
     * @param {TypeOf} node
     * @returns {any}
     */
    visitTypeOf(node) {
        throw new Error('Metodo visitTypeOf no implementado');
    }
    

    /**
     * @param {Bloque} node
     * @returns {any}
     */
    visitBloque(node) {
        throw new Error('Metodo visitBloque no implementado');
    }
    

    /**
     * @param {If} node
     * @returns {any}
     */
    visitIf(node) {
        throw new Error('Metodo visitIf no implementado');
    }
    

    /**
     * @param {While} node
     * @returns {any}
     */
    visitWhile(node) {
        throw new Error('Metodo visitWhile no implementado');
    }
    

    /**
     * @param {For} node
     * @returns {any}
     */
    visitFor(node) {
        throw new Error('Metodo visitFor no implementado');
    }
    

    /**
     * @param {Break} node
     * @returns {any}
     */
    visitBreak(node) {
        throw new Error('Metodo visitBreak no implementado');
    }
    

    /**
     * @param {Continue} node
     * @returns {any}
     */
    visitContinue(node) {
        throw new Error('Metodo visitContinue no implementado');
    }
    

    /**
     * @param {Return} node
     * @returns {any}
     */
    visitReturn(node) {
        throw new Error('Metodo visitReturn no implementado');
    }
    

    /**
     * @param {Llamada} node
     * @returns {any}
     */
    visitLlamada(node) {
        throw new Error('Metodo visitLlamada no implementado');
    }
    

    /**
     * @param {FuncDcl} node
     * @returns {any}
     */
    visitFuncDcl(node) {
        throw new Error('Metodo visitFuncDcl no implementado');
    }
    

    /**
     * @param {ClassDcl} node
     * @returns {any}
     */
    visitClassDcl(node) {
        throw new Error('Metodo visitClassDcl no implementado');
    }
    

    /**
     * @param {InstanciaStruct} node
     * @returns {any}
     */
    visitInstanciaStruct(node) {
        throw new Error('Metodo visitInstanciaStruct no implementado');
    }
    

    /**
     * @param {Instancia} node
     * @returns {any}
     */
    visitInstancia(node) {
        throw new Error('Metodo visitInstancia no implementado');
    }
    

    /**
     * @param {Get} node
     * @returns {any}
     */
    visitGet(node) {
        throw new Error('Metodo visitGet no implementado');
    }
    

    /**
     * @param {Set} node
     * @returns {any}
     */
    visitSet(node) {
        throw new Error('Metodo visitSet no implementado');
    }
    

    /**
     * @param {MatrixDeclaracion} node
     * @returns {any}
     */
    visitMatrixDeclaracion(node) {
        throw new Error('Metodo visitMatrixDeclaracion no implementado');
    }
    

    /**
     * @param {AsignacionMatriz} node
     * @returns {any}
     */
    visitAsignacionMatriz(node) {
        throw new Error('Metodo visitAsignacionMatriz no implementado');
    }
    

    /**
     * @param {AccesoMatriz} node
     * @returns {any}
     */
    visitAccesoMatriz(node) {
        throw new Error('Metodo visitAccesoMatriz no implementado');
    }
    
}
