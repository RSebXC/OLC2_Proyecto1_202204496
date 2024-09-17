import { Entorno } from "./entorno.js";
import { BaseVisitor } from "./visitor.js";
import nodos, { Expresion } from './nodos.js'
import { BreakException, ContinueException, ReturnException } from "./transferencia.js";
import { Invocable } from "./Invocable.js";
import { embebidas } from "./embebidas.js";
import { arrayLiteral } from "./nodos.js";
import { FuncionForanea } from "./foreanea.js";
import { Clase } from "./clase.js";
import { Instancia } from "./instancia.js";

function crearMatriz(dimensions, valorInicial) {
    if (dimensions.length === 0) return valorInicial;

    const [primeraDimension, ...restantesDimensiones] = dimensions;
    const matriz = new Array(primeraDimension).fill(null).map(() => {
        return crearMatriz(restantesDimensiones, valorInicial);
    });

    return matriz;
}

/*
function crearMatriz(dimensions, valorInicial) {
    // Si solo hay una dimensión, crear y devolver un array de esa longitud
    if (dimensions.length === 1) {
        return new Array(dimensions[0]).fill(valorInicial);
    }

    // Extraer la primera dimensión
    let size = dimensions[0];

    // Crear un array de la longitud especificada por la primera dimensión
    let matriz = [];

    // Para cada posición en la primera dimensión, generar recursivamente
    // una submatriz de las dimensiones restantes
    for (let i = 0; i < size; i++) {
        matriz.push(crearMatriz(dimensions.slice(1), valorInicial));
    }

    return matriz;
}
*/

export class InterpreterVisitor extends BaseVisitor {

    constructor() {
        super();
        this.entornoActual = new Entorno();

        // funciones embebidas
        Object.entries(embebidas).forEach(([nombre, funcion]) => {
            this.entornoActual.setVariable(nombre, funcion);
        });


        this.salida = '';
        this.errores = [];
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
                'int': { 'int': 'bool', 'float': 'bool' },
                'float': { 'int': 'bool', 'float': 'bool' },
                'bool': { 'bool': 'bool' },
                'string': { 'string': 'bool' },
                'char': { 'char': 'bool' }
            },
            '!=': {
                'int': { 'int': 'bool', 'float': 'bool' },
                'float': { 'int': 'bool', 'float': 'bool' },
                'bool': { 'bool': 'bool' },
                'string': { 'string': 'bool' },
                'char': { 'char': 'bool' }
            },
            '<=': {
                'int': { 'int': 'bool', 'float': 'bool' },
                'float': { 'int': 'bool', 'float': 'bool' },
                'char': { 'char': 'bool' }
            },
            '>=': {
                'int': { 'int': 'bool', 'float': 'bool' },
                'float': { 'int': 'bool', 'float': 'bool' },
                'char': { 'char': 'bool' }
            },
            '<': {
                'int': { 'int': 'bool', 'float': 'bool' },
                'float': { 'int': 'bool', 'float': 'bool' },
                'char': { 'char': 'bool' }
            },
            '>': {
                'int': { 'int': 'bool', 'float': 'bool' },
                'float': { 'int': 'bool', 'float': 'bool' },
                'char': { 'char': 'bool' }
            },
            '&&': {
                'bool': { 'bool': 'bool' }
            },
            '||': {
                'bool': { 'bool': 'bool' }
            }
        };
    }        

    getEntornoGlobal() {
        let entorno = this.entornoActual;
        while (entorno.padre) {
            entorno = entorno.padre;
        }
        return entorno;
    }

    interpretar(nodo) {
        try {
            return nodo.accept(this);
        } catch (e) {
            this.reportarError(e.message, nodo.linea || 0, nodo.columna || 0);
        }
    }

    reportarError(mensaje, linea, columna) {
        const error = { mensaje, linea, columna };
        this.errores.push(error);
        console.error(`Error: ${mensaje} en línea ${linea}, columna ${columna}`);
    }    

    getErrores() {
        return this.errores;
    }

    obtenerTipo(valor) {
        console.log('obtenerTipo - Valor recibido:', valor);
        if (typeof valor === 'number') {
            return Number.isInteger(valor) ? 'int' : 'float';
        }
        if (typeof valor === 'boolean') {
            return 'bool';
        }
        
        if (typeof valor === 'string') {
            // Verificar si la cadena es un char (comillas simples y solo un carácter o '\0')
            if ((valor.startsWith("'") && valor.endsWith("'") && valor.length === 3) || valor === "'\\0'") {
                return 'char';
            }
            // Verificar si la cadena es un string (comillas dobles)
            if (valor.startsWith('"') && valor.endsWith('"')) {
                return 'string';
            }
            // Si no tiene comillas, asume que es un string
            return 'string';
        }
        throw new Error(`Tipo desconocido: ${valor}`);
    }
    
    
    

    // Método para obtener el tipo resultante de una operación
    obtenerTipoResultado(op, tipoIzq, tipoDer) {
        console.log(op, tipoIzq, tipoDer);
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
            case '&&':
                return izq && der;
            case '||':
                return izq || der;
            case '+':
                // Manejar la concatenación de cadenas manualmente
                if (tipoIzq === 'string' && tipoDer === 'string') {
                    return izq + der;
                }
                // Si no son cadenas, realizar la operación numérica
                return izq + der;
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
            case '!':
                return !exp;
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
 * @type {BaseVisitor['visitArrayAccess']}
 */
visitArrayAccess(node) {
    const arrayVar = this.entornoActual.getVariable(node.array);
    if (!arrayVar || !Array.isArray(arrayVar.valor)) {
        throw new Error(`'${node.array}' no es un array válido`);
    }

    const index = node.index.accept(this);
    if (index < 0 || index >= arrayVar.valor.length) {
        console.error(`Error: Índice fuera de rango: ${index}`);
        return null;
    }

    return arrayVar.valor[index];
}

/**
 * @type {BaseVisitor['visitArrayAssignment']}
 */
visitArrayAssignment(node) {
    const arrayVar = this.entornoActual.getVariable(node.array);
    if (!arrayVar || !Array.isArray(arrayVar.valor)) {
        throw new Error(`'${node.array}' no es un array válido`);
    }

    const index = node.index.accept(this);
    if (index < 0 || index >= arrayVar.valor.length) {
        console.error(`Error: Índice fuera de rango: ${index}`);
        return null;
    }

    const valor = node.valor.accept(this);
    arrayVar.valor[index] = valor;

    return valor;
}


/**
 * @type {BaseVisitor['visitIndexOf']}
 */
visitIndexOf(node) {
    const arrayVar = this.entornoActual.getVariable(node.array);
    if (!arrayVar || !Array.isArray(arrayVar.valor)) {
        throw new Error(`'${node.array}' no es un array válido`);
    }

    const elemento = node.elem.accept(this);
    const index = arrayVar.valor.indexOf(elemento);

    return index !== -1 ? index : -1;
}

    /**
     * @type {BaseVisitor['visitDeclaracionVariable']}
     */
    visitDeclaracionVariable(node) {
        const nombreVariable = node.id;
        let valorVariable;

        // Asignar valor null si no hay expresión asociada
        if (node.exp) {
            valorVariable = node.exp.accept(this); // Obtener el valor asignado
        } else {
            valorVariable = null; // Asignar null como valor inicial
        }

        let tipoValor;

        // Intentar obtener el tipo del valor. Si falla (asignación incorrecta), asignar null.
        try {
            tipoValor = valorVariable === null ? node.tipo : this.obtenerTipo(valorVariable);
        } catch (error) {
            tipoValor = null;
            this.reportarError(`Error en la asignación de tipo de la variable ${nombreVariable}`, node.linea, node.columna);
        }

        // Si el tipo es 'var', permitir cualquier asignación, pero seguir verificando su tipo
        if (node.tipo === 'var') {
            this.entornoActual.setVariable(nombreVariable, { valor: valorVariable, tipo: tipoValor}, node.location.end.line, node.location.end.column);
        } 
        // Verificar si el tipo coincide con el declarado
        else if (tipoValor === node.tipo) {
            this.entornoActual.setVariable(nombreVariable, { valor: valorVariable, tipo: tipoValor }, node.location.end.line, node.location.end.column);
        }
        // Permitir conversiones de 'int' a 'float'
        else if (node.tipo === 'float' && tipoValor === 'int') {
            this.entornoActual.setVariable(nombreVariable, { valor: valorVariable, tipo: 'float' }, node.location.end.line, node.location.end.column);
        }
        // Si hay una mala asignación, asignar null
        else {
            this.entornoActual.setVariable(nombreVariable, { valor: null, tipo: node.tipo }, node.location.end.line, node.location.end.column);
        }
    }



    /**
     * @type {BaseVisitor['visitJoin']}
     *  */

    visitJoin(node) {
        console.log('visitJoin - Nodo recibido:', node);
        const array = this.entornoActual.getVariable(node.array);
        if (!Array.isArray(array.valor)) {
            throw new Error("Expected an array for join operation");
        }
        return array.valor.join();
    }
    

/**
 * @type {BaseVisitor['visitLength']}
 */
visitLength(node) {
    const arrayVar = this.entornoActual.getVariable(node.array);
    if (!arrayVar || !Array.isArray(arrayVar.valor)) {
        throw new Error(`'${node.array}' no es un array válido`);
    }

    return arrayVar.valor.length;
}

    /**
      * @type {BaseVisitor['visitReferenciaVariable']}
      */
    visitReferenciaVariable(node) {
        const variable = this.entornoActual.getVariable(node.id);
        console.log('visitReferenciaVariable - Variable encontrada:', variable);
        return variable.valor; // Solo devuelve el valor
        
    }
    
        visitParseInt(node) {
            const valor = node.exp.accept(this); // Evalúa la expresión que contiene el nodo
            if (typeof valor === 'string') {
                return parseInt(valor);  // Convierte la cadena a un entero
            } else {
                throw new Error("parseInt solo acepta cadenas");
            }
        }
    
        visitParseFloat(node) {
            const valor = node.exp.accept(this);
            if (typeof valor === 'string') {
                return parseFloat(valor);  // Convierte la cadena a un número de punto flotante
            } else {
                throw new Error("parseFloat solo acepta cadenas");
            }
        }
    
        visitToLowerCase(node) {
            const valor = node.exp.accept(this);
            if (typeof valor === 'string') {
                return valor.toLowerCase();
            } else {
                throw new Error("toLowerCase solo funciona con cadenas");
            }
        }
    
        visitToUpperCase(node) {
            const valor = node.exp.accept(this);
            if (typeof valor === 'string') {
                return valor.toUpperCase();
            } else {
                throw new Error("toUpperCase solo funciona con cadenas");
            }
        }
    
        visitToString(node) {
            const valor = node.exp.accept(this);
            return valor.toString();  // Convierte a cadena cualquier tipo de valor
        }
    
        visitTypeOf(node) {
            const valor = node.exp.accept(this);
        
            // Detectar el tipo de dato basado en el valor
            if (typeof valor === 'number') {
                if (Number.isInteger(valor)) {
                    return 'int';  // Si es un número entero, lo consideramos 'int'
                } else {
                    return 'float';  // Si es un número con decimales, lo consideramos 'float'
                }
            } else if (typeof valor === 'string') {
                // Aquí puedes hacer una distinción entre 'string' y 'char' si es necesario
                return valor.length === 1 ? 'string' : 'char';
            } else if (typeof valor === 'boolean') {
                return 'bool';
            } else {
                throw new Error(`Tipo desconocido para el valor: ${valor}`);
            }
        }
        
    





  /**
 * @type {BaseVisitor['visitPrint']}
 */
visitPrint(node) {
    const valores = Array.isArray(node.exp)
        ? node.exp.map(exp => {
            const valor = exp.accept(this);
            return valor === null ? "null" : valor; // Retorna "null" si el valor es null
        })
        : [node.exp.accept(this)]; // Si no es un array, lo tratamos como un solo valor

    console.log('valores', valores);

    const concatenado = valores.join(' '); // Concatenamos con un espacio entre cada valor
    this.salida += concatenado + '\n'; // Agregamos la salida concatenada
}


    


    /**
 * @type {BaseVisitor['visitSwitch']}
 */
visitSwitch(node) {
    const valorCondicion = node.expr?.accept(this); // Evaluar la condición del switch

    if (valorCondicion === undefined) {
        throw new Error("Expresión del switch no definida o no válida");
    }

    let caseMatched = false; // Variable para indicar si algún caso ha coincidido

    for (let i = 0; i < node.cases.length; i++) {
        const caso = node.cases[i];

        

        // Si ya se ha encontrado un caso coincidente, ejecutar el resto sin volver a evaluar.
        if (caseMatched || caso.expr.accept(this) === valorCondicion) {
            caseMatched = true;
            console.log(caso);
            try {
                caso.stmts.forEach(stmt => stmt.accept(this));
            } catch (error) {
                if (error instanceof BreakException) {
                    return; // Si se encuentra un break, salir del switch
                }
                throw error; // Propagar otros errores
            }
        }
    }

    // Si no se ha encontrado un caso coincidente y hay un caso default, ejecutarlo
    if (node.defaultCase) {
        try {
            node.defaultCase.stmts.forEach(stmt => stmt.accept(this));
        }
        catch (error) {
            if (error instanceof BreakException) {
                return;
            }
            throw error;
        }
    }   
        
    }

/**
 * Retorna el valor por defecto basado en el tipo de datos.
 */
_obtenerValorPorDefecto(tipo) {
    switch (tipo) {
        case 'int':
            return 0;
        case 'float':
            return 0.0;
        case 'string':
            return "";
        case 'boolean':
            return false;
        case 'char':
            return '\u0000';
        case 'struct':
            return null;
        default:
            throw new Error(`Tipo no soportado: ${tipo}`);
    }
}

/**
 * @type {BaseVisitor['visitDeclaracionArray']}
 */
visitDeclaracionArray(node) {
    console.log('visitDeclaracionArray - Nodo recibido:', node);

    if (node.tipoArray && node.tamano) {
        const tamano = Number(node.tamano.accept(this)); // Convertir 'tamano' a número

        if (isNaN(tamano)) {
            console.error("Error: 'tamano' no es un número válido");
            throw new Error("Tamaño del arreglo debe ser un número válido");
        }

        console.log(`Declarando arreglo ${node.id} de tipo ${node.tipoArray} con tamaño ${tamano}`);

        if (!this._esTipoValido(node.tipoArray)) {
            console.error(`Error: Tipo de arreglo '${node.tipoArray}' no válido`);
            throw new Error(`Tipo inválido para el arreglo '${node.id}'`);
        }

        // Inicializar array con valores predeterminados
        const arrayInicializado = new Array(tamano).fill(this._obtenerValorPorDefecto(node.tipoArray));

        // Asignar el array inicializado al entorno
        this.entornoActual.setVariable(node.id, {
            tipo: node.tipoArray,
            valor: arrayInicializado
        });
    } else if (node.array) {
        // Declaración de arreglo con valores literales
        if (!(node.array instanceof arrayLiteral)) {
            console.error("Error: 'array' es undefined o no es un 'ArrayLiteral' en 'DeclaracionArray'");
            throw new Error("Propiedad 'array' no definida o no es 'ArrayLiteral' en 'DeclaracionArray'");
        }

        const elementos = node.array.accept(this); // Esto llama a `visitArrayLiteral`
        console.log('Elementos procesados del array:', elementos);

        // Verificar tipos de elementos en el array
        elementos.forEach(elemento => {
            if (!this._esTipoValido(node.tipo, elemento)) {  // Cambiado a node.tipo en lugar de node.tipoArray
                throw new Error(`Tipo inválido de elemento '${elemento}' para el tipo de array '${node.tipo}'`);
            }
        });

        // Asigna los elementos a la variable en el entorno del intérprete
        this.entornoActual.setVariable(node.id, {
            tipo: node.tipo,
            valor: elementos
        });
    } else {
        console.error("Error: Falta información para la declaración de arreglo");
        throw new Error("Falta información para la declaración de arreglo");
    }
}


/**
 * @type {BaseVisitor['visitarrayLiteral']}
 */
visitarrayLiteral(node) {
    // Imprimir el nodo completo para depuración
    console.log("visitArrayLiteral - Nodo recibido:", node);

    // Verificar que la propiedad 'elems' exista antes de utilizarlas
    if (!node.elems) {
        console.error("Error: 'elems' es undefined en 'ArrayLiteral'");
        throw new Error("Propiedad 'elems' no definida en 'ArrayLiteral'");
    }

    // Evaluar cada elemento en la lista de expresiones del array
    const elementos = node.elems.map(elemento => {
        console.log("Evaluando elemento en ArrayLiteral:", elemento);
        return elemento.accept(this);
    });

    console.log("ArrayLiteral evaluado con elementos:", elementos);

    return elementos; 
}

/**
 * Verifica si el tipo del elemento es válido para el tipo del array.
 */
_esTipoValido(tipoEsperado) {
    // Verifica si el tipo esperado es uno de los tipos primitivos válidos
    const tiposValidos = ['int', 'string', 'bool', 'float'];

    return tiposValidos.includes(tipoEsperado);
}


/**
 * @type {BaseVisitor['visitAsignacionArray']}
 */
visitAsignacionArray(node) {
    console.log('visitAsignacionArray - Nodo recibido:', node);

    // Busca el array fuente en el entorno actual
    const arrayFuente = this.entornoActual.getVariable(node.source);

    if (!arrayFuente) {
        console.error(`Error: El array '${node.source}' no está definido`);
        throw new Error(`El array '${node.source}' no está definido`);
    }

    // Verifica que el tipo del array fuente coincida con el tipo declarado
    if (arrayFuente.tipo !== node.tipo) {
        console.error(`Error: Tipo incompatible en la asignación. Se esperaba '${node.tipo}', pero se encontró '${arrayFuente.tipo}'`);
        throw new Error(`Tipo incompatible en la asignación de '${node.id}'`);
    }

    // Crea una copia del array fuente
    const copiaArray = [...arrayFuente.valor];

    // Asigna la copia al nuevo identificador en el entorno
    this.entornoActual.setVariable(node.id, {
        tipo: node.tipo,
        valor: copiaArray
    });

    console.log(`Array '${node.id}' ha sido asignado con éxito como copia de '${node.source}'`);
}




/**
 * @type {BaseVisitor['visitMatrixDeclaracion']}
 */
visitMatrixDeclaracion(node) {
    console.log('visitMatrixDeclaration - Nodo recibido:', node);

    const tipo = node.tipo;
    const id = node.id;
    let matrizInicializada;

    if (Array.isArray(node.size)) {
        console.log('Inicializando matriz con tamaños fijos:', node.size);
        node.valores = node.valores.map(elem => elem.accept(this));
        matrizInicializada = crearMatriz(node.valores, this._obtenerValorPorDefecto(tipo));
    } else if (Array.isArray(node.valores)) {
        const armarMatriz = (array, tipo) => {
            console.log(array, "array");
            if (Array.isArray(array)) {
                // Validamos que todos los sub-arrays tengan las mismas dimensiones
        
                let matrizFinal = [];
                for (let element of array) {
                    let value = armarMatriz(element, tipo);
                    matrizFinal.push(value); // Solo agregamos el valor procesado
                }
                return matrizFinal;
            } else {
                let valorProcesado = array.accept(this);
                if (this.obtenerTipo(valorProcesado) !== tipo) {
                    if(tipo === "float" && this.obtenerTipo(valorProcesado) === "int"){               
                         return valorProcesado;
                    }else{
                        console.error("El tipo no coincide:", this.obtenerTipo(valorProcesado), "vs esperado:", tipo);
                    }
                    return null; // Si el tipo no coincide, devolvemos null y detenemos el proceso
                }
                return valorProcesado; // Retornamos el valor final procesado

            
        }
};

        matrizInicializada = armarMatriz(node.valores, tipo);


    }

    // Asignar la matriz inicializada al entorno
    this.entornoActual.setVariable(id, {
        tipo,
        valor: matrizInicializada
    });
}


/**
 * @type {BaseVisitor['visitAccesoMatriz']}
 */
visitAccesoMatriz(node) {
    console.log('visitAccesoMatriz - Nodo recibido:', node);

    const id = node.array; // Identificador de la matriz
    console.log('ID de la matriz:', id);
    console.log('Índices:', node.indices);
    const indices = node.indices.map(indice => {
        console.log('Nodo índice antes de evaluación:', indice);
        const valorIndice = typeof indice.accept === 'function' ? indice.accept(this) : indice;
        console.log(`Índice evaluado: ${valorIndice}`); // Depuración del valor del índice

        if (typeof valorIndice !== 'number' || isNaN(valorIndice)) {
            throw new Error(`El índice debe ser un número, pero se encontró: ${valorIndice}`);
        }

        return valorIndice;
    });

    // Verificar que la matriz esté en el entorno actual
    const variable = this.entornoActual.getVariable(id);
    if (!variable || !Array.isArray(variable.valor)) {
        throw new Error(`La variable ${id} no es una matriz o no existe.`);
    }

    let matriz = variable.valor;

    // Navegar a través de los niveles de la matriz usando los índices
    for (let i = 0; i < indices.length; i++) {
        const indiceActual = indices[i];

        // Verificar si el índice está dentro de rango
        if (indiceActual < 0 || indiceActual >= matriz.length) {
            throw new Error(`Índice fuera de rango en la dimensión ${i + 1} de la matriz ${id}`);
        }

        matriz = matriz[indiceActual];
    }

    // Retornar el valor encontrado
    return matriz;
}



/**
 * @type {BaseVisitor['visitAsignacionMatriz']}
 */
visitAsignacionMatriz(node) {
    console.log('visitAsignacionMatriz - Nodo recibido:', node);

    const id = node.array; // Identificador de la matriz
    const indices = node.indices.map(indice => {
        const valorIndice = typeof indice.accept === 'function' ? indice.accept(this) : indice;
        console.log(`Índice evaluado: ${valorIndice}`); // Depuración del valor del índice
    
        if (typeof valorIndice !== 'number' || isNaN(valorIndice)) {
            throw new Error(`El índice debe ser un número, pero se encontró: ${valorIndice}`);
        }
    
        return valorIndice;
    });
    

    const valorAsignacion = node.valor.accept(this);
    console.log(`Valor a asignar:`, valorAsignacion);

    // Verificar que la matriz esté en el entorno actual
    const variable = this.entornoActual.getVariable(id);
    if (!variable || !Array.isArray(variable.valor)) {
        throw new Error(`La variable ${id} no es una matriz o no existe.`);
    }

    let matriz = variable.valor;
    let nivelActual = matriz;

    console.log('Matriz antes de la asignación:', matriz);

    for (let i = 0; i < indices.length - 1; i++) {
        const indiceActual = indices[i];
        console.log(`Accediendo a la dimensión ${i + 1}, longitud actual:`, nivelActual.length);

        if (Array.isArray(nivelActual) && indiceActual >= 0 && indiceActual < nivelActual.length) {
            nivelActual = nivelActual[indiceActual];
            console.log(`Nivel actual en la dimensión ${i + 1}:`, nivelActual);
        } else {
            throw new Error(`Índice fuera de rango en la dimensión ${i + 1} de la matriz ${id}`);
        }
    }

    const ultimoIndice = indices[indices.length - 1];
    if (Array.isArray(nivelActual) && ultimoIndice >= 0 && ultimoIndice < nivelActual.length) {
        nivelActual[ultimoIndice] = valorAsignacion;
        console.log(`Valor asignado correctamente en la posición ${indices}:`, valorAsignacion);
    } else {
        throw new Error(`Índice fuera de rango en la última dimensión de la matriz ${id}`);
    }

    console.log(`Valor asignado a la matriz ${id} en la posición ${indices}:`, valorAsignacion);
}




/**
 * Obtiene el valor por defecto según el tipo.
 */
_obtenerValorPorDefecto(tipo) {
    switch (tipo) {
        case 'int': return 0;
        case 'float': return 0.0;
        case 'boolean': return false;
        default: return null;
    }
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
        const variable = this.entornoActual.getVariable(node.id);
        const valorActual = variable.valor;
        const tipoValorActual = variable.tipo;

        let valorAsignacion = node.asgn.accept(this);
        let tipoValorAsignacion;
        console.log('valorAsignacion', valorAsignacion);
        // Intentar obtener el tipo del valor asignado. Si falla, asignar null.
        try {
            tipoValorAsignacion = this.obtenerTipo(valorAsignacion);
            console.log('tipoValorAsignacion', tipoValorAsignacion);

        } catch (error) {
            tipoValorAsignacion = null;
        }

        // Verificar si el tipo de la asignación es correcto, o si se debe asignar null
        if (tipoValorAsignacion !== tipoValorActual) {
            valorAsignacion = null; // Asignar null si el tipo no coincide
        }

        switch (node.op) {
            case '+=':
                valorAsignacion = valorActual + valorAsignacion;
                break;
            case '-=':
                valorAsignacion = valorActual - valorAsignacion;
                break;
            case '=':
            default:
                break;
        }
        console.log('valorAsignacion', valorAsignacion);
        // Almacena el valor actualizado (o null) y el tipo
        this.entornoActual.assignVariable(node.id, { valor: valorAsignacion, tipo: tipoValorActual });

        return valorAsignacion;
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
        if (node.inc) {
            
        
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
    else{
        const entornoConElQueEmpezo = this.entornoActual;
        const init = node.init.accept(this);
        console.log(node.cond);
        const arreglo = node.cond.accept(this);
        arreglo.forEach(elemento => {
            // Asegurar el tipo de la variable de iteración
            console.log(init);
            if (this.obtenerTipo(elemento) !== node.init.tipo) {
                throw new Error(`Error de tipo: Se esperaba un elemento de tipo '${node.init.tipo}' en el arreglo, pero se encontró '${typeof elemento}'.`);
            }
    
           this.entornoActual.assignVariable(node.init.id, { valor: elemento, tipo: node.init.tipo });
    
            try {
                // Ejecutar el bloque de sentencias
                node.stmt.accept(this);
            } catch (error) {
                if (error.message === 'break') {
                    // Manejar la sentencia 'break'
                    console.log('Sentencia break encontrada en foreach, saliendo del bucle.');
                    return;
                } else if (error.message === 'continue') {
                    // Manejar la sentencia 'continue'
                    console.log('Sentencia continue encontrada en foreach, continuando el bucle.');
                    return; // Volver al siguiente elemento
                } else {
                    throw error;
                }
            }});}  
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
        console.log('argumentos', argumentos);
        console.log('funcion', funcion);
        
        if (!(funcion instanceof Invocable)) {
            throw new Error('No es invocable');
            // 1() "sdalsk"()
        }

        if (funcion.aridad() !== argumentos.length) {
            throw new Error('Aridad incorrecta');
        }

        return funcion.invocar(this, argumentos);
    }

    /**
     * @type {BaseVisitor['visitFuncDcl']}
     * */ 
    visitFuncDcl(node) {
        const paramsUnicos = new Set(node.params.map(param => param.id));
        if (paramsUnicos.size !== node.params.length) {
            throw new Error(`Error: Existen parámetros duplicados en la declaración de la función ${node.id}`);
        }
    
        node.params.forEach(param => {
            if (!param.tipo) {
                throw new Error(`Error: El parámetro ${param.id} no tiene un tipo definido`);
            }
        });
    
        const funcion = new FuncionForanea(node, this.entornoActual);
        this.entornoActual.setVariable(node.id, { valor: funcion, tipo: 'funcion' });
    }
    


    /**
 * @type {BaseVisitor['visitClassDcl']}
 */
visitClassDcl(node) {
    const metodos = {};
    const propiedades = {};

    // Recorre cada declaración dentro del struct
    node.dcls.forEach(dcl => {
        if (dcl instanceof nodos.FuncDcl) {
            metodos[dcl.id] = new FuncionForanea(dcl, this.entornoActual);
        } else if (dcl instanceof nodos.VarDcl) {
            propiedades[dcl.id] = dcl.exp ? dcl.exp.accept(this) : null;
        }
    });

    // Crea un nuevo struct (Clase) con propiedades y métodos
    const struct = new Clase(node.id, propiedades, metodos);

    // Guarda el struct en el entorno actual
    this.entornoActual.setVariable(node.id, { tipo: 'struct', valor: struct });
}

/**
 * @type {BaseVisitor['visitInstanciaStruct']}
 */
visitInstanciaStruct(node) {
    const struct = this.entornoActual.getVariable(node.id);
    if (!(struct instanceof Clase)) {
        throw new Error(`El tipo ${node.id} no es un struct válido.`);
    }

    const instancia = new Instancia(struct);
    
    // Asigna las propiedades pasadas al struct
    node.valores.forEach(prop => {
        const valor = prop.valor.accept(this);
        instancia.set(prop.id, valor);
    });

    return instancia;
}

    /**
    * @type {BaseVisitor['visitInstancia']}
    */
    visitInstancia(node) {

        const clase = this.entornoActual.getVariable(node.id);

        const argumentos = node.args.map(arg => arg.accept(this));


        if (!(clase instanceof Clase)) {
            throw new Error('No es posible instanciar algo que no es una clase');
        }



        return clase.invocar(this, argumentos);
    }


    /**
    * @type {BaseVisitor['visitGet']}
    */
    visitGet(node) {

        // var a = new Clase();
        // a.propiedad
        const instancia = node.objetivo.accept(this);

        if (!(instancia instanceof Instancia)) {
            console.log(instancia);
            throw new Error('No es posible obtener una propiedad de algo que no es una instancia');
        }

        return instancia.get(node.propiedad);
    }

    /**
    * @type {BaseVisitor['visitSet']}
    */
    visitSet(node) {
        const instancia = node.objetivo.accept(this);

        if (!(instancia instanceof Instancia)) {
            throw new Error('No es posible asignar una propiedad de algo que no es una instancia');
        }

        const valor = node.valor.accept(this);

        instancia.set(node.propiedad, valor);

        return valor;
    }

}