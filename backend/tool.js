/**
 * DISCLAIMER:
 * Este código fue desarrollado con fines puramente didácticos.
 * Su objetivo principal es demostrar la implementación del patrón de diseño Visitor 
 * utilizando peggy.js como generador de analizadores y agregando anotaciones JSDoc 
 * para mejorar la comprensión y la documentación del código.
 * 
 * La estructura y los conceptos presentados en este archivo tienen la intención de 
 * facilitar el aprendizaje y la enseñanza de patrones de diseño y documentación en 
 * JavaScript. No se recomienda su uso en entornos de producción.
 * 
 * @autor: @damianpeaf
 * 
 */


// import fs from 'fs';
const fs = require('fs')

const types = [
    `
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
    `
]

const configuracionNodos = [
    // Configuracion del nodo inicial
    {
        name: 'Expresion',
        base: true,
        props: [
            {
                name: 'location',
                type: 'Location|null',
                description: 'Ubicacion del nodo en el codigo fuente',
                default: 'null'
            }
        ]
    },
    // Configuracion de los nodos secundarios
    {
        name: 'OperacionBinaria',
        extends: 'Expresion',
        props: [
            {
                name: 'izq',
                type: 'Expresion',
                description: 'Expresion izquierda de la operacion'
            },
            {
                name: 'der',
                type: 'Expresion',
                description: 'Expresion derecha de la operacion'
            },
            {
                name: 'op',
                type: 'string',
                description: 'Operador de la operacion'
            }
        ]
    },
    {
        name: 'OperacionUnaria',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion de la operacion'
            },
            {
                name: 'op',
                type: 'string',
                description: 'Operador de la operacion'
            }
        ]
    },
    {
        name: 'Agrupacion',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion agrupada'
            }
        ]
    },
    {
        name: 'Dato',
        extends: 'Expresion',
        props: [
            {
                name: 'valor',
                type: 'any',
                description: 'Valor del numero'
            },
            {
                name: 'tipo',
                type: 'string',
                description: 'Tipo del dato'
            }
        ]
    },
    //     DeclaracionVariable
    {
        name: 'DeclaracionVariable',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la variable'
            },
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion de la variable'
            },
            {
                name: 'tipo',
                type: 'string',
                description: 'tipo de la variable'
            }
        ]
    },
    // ReferenciaVariable
    {
        name: 'ReferenciaVariable',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la variable'
            }
        ]
    },
    // Print
    {
        name: 'Print',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a imprimir'
            }
        ]
    },
    // ExpresionStmt 1+2;
    {
        name: 'ExpresionStmt',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a evaluar'
            }
        ]
    },
    {
        name: 'DeclaracionArray',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador del array'
            },
            {
                name: 'tipo',
                type: 'Expresion',
                description: 'Tipo de los elementos del array'
            },
            {
                name: 'tipoArray',
                type: 'Expresion',
                description: 'Tipo del array (para la declaración con new)'
            },
            {
                name: 'tamano',
                type: 'Expresion',
                description: 'Tamaño del array (para la declaración con new)'
            },
            {
                name: 'array',
                type: 'arrayLiteral',
                description: 'Elementos del array (para la declaración con valores literales)'
            }
        ]
    },
    {
        name: 'arrayLiteral',
        extends: 'Expresion',
        props: [
            {
                name: 'elems',
                type: 'Array<Expresion>',
                description: 'Elementos del array'
            }
        ]
    },
    {
        name: 'AsignacionArray',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador del array que recibe la asignación'
            },
            {
                name: 'source',
                type: 'string',
                description: 'Identificador del array fuente'
            },
            {
                name: 'tipo',
                type: 'Expresion',
                description: 'Tipo de los elementos del array'
            }
        ]
    },
    {
        name: 'IndexOf',
        extends: 'Expresion',
        props: [
            {
                name: 'array',
                type: 'string',
                description: 'Identificador del array'
            },
            {
                name: 'elem',
                type: 'Expresion',
                description: 'Elemento a buscar en el array'
            }
        ]
    },
    {
        name: 'Join',
        extends: 'Expresion',
        props: [
            {
                name: 'array',
                type: 'string',
                description: 'Identificador del array'
            }
        ]
    },
    {
        name: 'Length',
        extends: 'Expresion',
        props: [
            {
                name: 'array',
                type: 'string',
                description: 'Identificador del array'
            }
        ]
    },        
    {
        name: 'ArrayAccess',
        extends: 'Expresion',
        props: [
            {
                name: 'array',
                type: 'string',
                description: 'Identificador del array'
            },
            {
                name: 'index',
                type: 'Expresion',
                description: 'Índice del elemento'
            }
        ]
    },
    {
        name: 'ArrayAssignment',
        extends: 'Expresion',
        props: [
            {
                name: 'array',
                type: 'string',
                description: 'Identificador del array'
            },
            {
                name: 'index',
                type: 'Expresion',
                description: 'Índice del elemento'
            },
            {
                name: 'valor',
                type: 'Expresion',
                description: 'Nuevo valor para asignar'
            }
        ]
    },    
    // Asignacion
    {
        name: 'Asignacion',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la variable'
            },
            {
                name: 'asgn',
                type: 'Expresion',
                description: 'Expresion a asignar'
            },
            {
                name: 'op',
                type: 'string',
                description: 'Operador de asignacion'
            }
        ]
    },
    {
        name: 'Switch',
        extends: 'Expresion',
        props: [
            {
                name: 'expr',
                type: 'Expresion',
                description: 'Expresion a evaluar'
            },
            {
                name: 'cases',
                type: 'Expresion[]',
                description: 'Casos del switch'
            },
            {
                name: 'defaultCase',
                type: 'Expresion',
                description: 'Caso por defecto'
            }
        ]
    },
    {
        name: 'ParseInt',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a evaluar'
            }
        ]
    },
    {
        name: 'ParseFloat',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a evaluar'
            }
        ]
    },
    {
        name: 'ToString',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a evaluar'
            }
        ]
    },
    {
        name: 'ToLowerCase',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a evaluar'
            }
        ]
    },
    {
        name: 'ToUpperCase',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a evaluar'
            }
        ]
    },
    {
        name: 'TypeOf',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion',
                description: 'Expresion a evaluar'
            }
        ]
    },
    // Bloque
    {
        name: 'Bloque',
        extends: 'Expresion',
        props: [
            {
                name: 'dcls',
                type: 'Expresion[]',
                description: 'Sentencias del bloque'
            }
        ]
    },
    {
        name: 'If',
        extends: 'Expresion',
        props: [
            {
                name: 'cond',
                type: 'Expresion',
                description: 'Condicion del if'
            },
            {
                name: 'stmtTrue',
                type: 'Expresion',
                description: 'Cuerpo del if'
            },
            {
                name: 'stmtFalse',
                type: 'Expresion|undefined',
                description: 'Cuerpo del else'
            }
        ]
    },
    // While
    {
        name: 'While',
        extends: 'Expresion',
        props: [
            {
                name: 'cond',
                type: 'Expresion',
                description: 'Condicion del while'
            },
            {
                name: 'stmt',
                type: 'Expresion',
                description: 'Cuerpo del while'
            }
        ]
    },
    //       return crearNodo('for', { init, cond, inc, stmt })
    {
        name: 'For',
        extends: 'Expresion',
        props: [
            {
                name: 'init',
                type: 'Expresion',
                description: 'Inicializacion del for'
            },
            {
                name: 'cond',
                type: 'Expresion',
                description: 'Condicion del for'
            },
            {
                name: 'inc',
                type: 'Expresion',
                description: 'Incremento del for'
            },
            {
                name: 'stmt',
                type: 'Expresion',
                description: 'Cuerpo del for'
            }
        ]
    },
    
    // / "break" _ ";" { return crearNodo('break') }
    {
        name: 'Break',
        extends: 'Expresion',
        props: []
    },
    // / "continue" _ ";" { return crearNodo('continue') }
    {
        name: 'Continue',
        extends: 'Expresion',
        props: []
    },
    // / "return" _ exp:Expresion? _ ";" { return crearNodo('return', { exp }) }
    {
        name: 'Return',
        extends: 'Expresion',
        props: [
            {
                name: 'exp',
                type: 'Expresion|undefined',
                description: 'Expresion a retornar'
            }
        ]
    },
    // return crearNodo('llamada', { calle, args })
    {
        name: 'Llamada',
        extends: 'Expresion',
        props: [
            {
                name: 'callee',
                type: 'Expresion',
                description: 'Expresion a llamar'
            },
            {
                name: 'args',
                type: 'Expresion[]',
                description: 'Argumentos de la llamada'
            }
        ]
    },
    {
        name: 'FuncDcl',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la funcion'
            },
            {
                name: 'params',
                type: 'Array<{tipo: string, id: string}>',
                description: 'Parametros de la funcion'
            },
            {
                name: 'bloque',
                type: 'Bloque',
                description: 'Cuerpo de la funcion'
            }
        ]
    },    
    // ClassDcl
    // rearNodo('dclClase', { id, dcls }) }
    {
        name: 'ClassDcl',
        extends: 'Expresion',
        props: [
            { 
                name: 'id', 
                type: 'string', 
                description: 'Identificador del struct' 
            },
            { 
                name: 'dcls', 
                type: 'Expresion[]', 
                description: 'Declaraciones del struct' 
            }
        ]
    },
    {
        name: 'InstanciaStruct',
        extends: 'Expresion',
        props: [
            { 
                name: 'id', 
                type: 'string', 
                description: 'Nombre del struct' 
            },
            { 
                name: 'valores', 
                type: 'Object.<string, Expresion>', 
                description: 'Valores de las propiedades' 
            }
        ]
    },     
    //   / "new" _ id:Identificador _ "(" _ Argumentos? _ ")" { return crearNodo('instancia', { id, args: args || [] }) }
    {
        name: 'Instancia',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador de la clase'
            },
            {
                name: 'args',
                type: 'Expresion[]',
                description: 'Argumentos de la instancia'
            }
        ]
    },
    // return crearNodo('get', { objetivo, propiedad: id })
    {
        name: 'Get',
        extends: 'Expresion',
        props: [
            {
                name: 'objetivo',
                type: 'Expresion',
                description: 'Objeto de la propiedad'
            },
            {
                name: 'propiedad',
                type: 'string',
                description: 'Identificador de la propiedad'
            }
        ]
    },
    {
        name: 'Set',
        extends: 'Expresion',
        props: [
            {
                name: 'objetivo',
                type: 'Expresion',
                description: 'Objeto de la propiedad'
            },
            {
                name: 'propiedad',
                type: 'string',
                description: 'Identificador de la propiedad'
            },
            {
                name: 'valor',
                type: 'Expresion',
                description: 'Valor de la propiedad'
            }
        ]
    },
    {
        name: 'MatrixDeclaracion',
        extends: 'Expresion',
        props: [
            { 
                name: 'id', 
                type: 'string', 
                description: 'Identificador de la matriz' 
            },
            { 
                name: 'tipo', 
                type: 'Tipos', 
                description: 'Tipo de los elementos de la matriz' 
            },
            { 
                name: 'valores', 
                type: 'FormasMatrix', 
                description: 'Valores iniciales de la matriz o declaración con tamaños' 
            },
            { 
                name: 'size', 
                type: 'number | Array<Expresion>', 
                description: 'Tamaños de las dimensiones de la matriz' 
            }
        ]
    },
    //MatrixAssignment = array:Identificador _ indices:("[" _ Expresion _ "]")+ _ "=" _ valor:Expresion _ ";" {return crearNodo('asignacionMatriz', { array, indices, valor });}
    {
        name: 'AsignacionMatriz',
        extends: 'Expresion',
        props: [
            {
                name: 'array',
                type: 'string',
                description: 'Identificador de la matriz'
            },
            {
                name: 'indices',
                type: 'Expresion[]',
                description: 'Indices de la matriz'
            },
            {
                name: 'valor',
                type: 'Expresion',
                description: 'Valor a asignar'
            }
        ]
    },
    //MatrixAccess = array:Identificador _ indices:("[" _ Expresion _ "]")+ { return crearNodo('accesoMatriz', { array, indices }); }
    {
        name: 'AccesoMatriz',
        extends: 'Expresion',
        props: [
            {
                name: 'array',
                type: 'string',
                description: 'Identificador de la matriz'
            },
            {
                name: 'indices',
                type: 'Expresion[]',
                description: 'Indices de la matriz'
            }
        ]
    },
    //AccesoPropiedad = objeto:Identificador "." propiedad:Identificador { return crearNodo('AccesoPropiedad', { objeto, propiedad }); }
    {
        name: 'AccesoPropiedad',
        extends: 'Expresion',
        props: [
            {
                name: 'objeto',
                type: 'string',
                description: 'Identificador del objeto'
            },
            {
                name: 'propiedad',
                type: 'string',
                description: 'Identificador de la propiedad'
            }
        ]
    },
    //AsignacionPropiedad = acceso:AccesoPropiedad _ "=" _ valor:Expresion _ ";" { return crearNodo('AsignacionPropiedad', { acceso, valor }); }
    {
        name: 'AsignacionPropiedad',
        extends: 'Expresion',
        props: [
            {
                name: 'acceso',
                type: 'AccesoPropiedad',
                description: 'Acceso a la propiedad'
            },
            {
                name: 'valor',
                type: 'Expresion',
                description: 'Valor a asignar'
            }
        ]
    },
    //ObjectKeys = "Object.keys" _ "(" _ obj:Identificador _ ")" _ ";" { return crearNodo('ObjectKeys', { obj }); }
    {
        name: 'ObjectKeys',
        extends: 'Expresion',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'Identificador del objeto'
            }
        ]
    }
    

]

let code = ''

// Tipos base
types.forEach(type => {
    code += type + '\n'
})


// // Tipos de nodos
// configuracionNodos.forEach(nodo => {
//     code += `
// /**
//  * @typedef {Object} ${nodo.name}
//  * ${nodo.props.map(prop => `@property {${prop.type}} ${prop.name} ${prop.description}`).join('\n * ')}
// */
//     `
// })

// Tipos del visitor
code += `
/**
 * @typedef {import('./visitor').BaseVisitor} BaseVisitor
 */
`

const baseClass = configuracionNodos.find(nodo => nodo.base)

configuracionNodos.forEach(nodo => {


    code += `
export class ${nodo.name} ${baseClass && nodo.extends ? `extends ${nodo.extends}` : ''} {

    /**
    * @param {Object} options
    * ${nodo.props.map(prop => `@param {${prop.type}} options.${prop.name} ${prop.description}`).join('\n * ')}
    */
    constructor(${!nodo.base && nodo.props.length > 0 && `{ ${nodo.props.map(prop => `${prop.name}`).join(', ')} }` || ''}) {
        ${baseClass && nodo.extends ? `super();` : ''}
        ${nodo.props.map(prop => `
        /**
         * ${prop.description}
         * @type {${prop.type}}
        */
        this.${prop.name} = ${prop.default || `${prop.name}`};
`).join('\n')}
    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visit${nodo.name}(this);
    }
}
    `
})

code += `
export default { ${configuracionNodos.map(nodo => nodo.name).join(', ')} }
`


fs.writeFileSync('./nodos.js', code)
console.log('Archivo de clases de nodo generado correctamente')


// Visitor
// @typedef {import('./nodos').Expresion} Expresion
code = `
/**
${configuracionNodos.map(nodo => `
 * @typedef {import('./nodos').${nodo.name}} ${nodo.name}
`).join('\n')}
 */
`

code += `

/**
 * Clase base para los visitantes
 * @abstract
 */
export class BaseVisitor {

    ${configuracionNodos.map(nodo => `
    /**
     * @param {${nodo.name}} node
     * @returns {any}
     */
    visit${nodo.name}(node) {
        throw new Error('Metodo visit${nodo.name} no implementado');
    }
    `).join('\n')
    }
}
`

fs.writeFileSync('./visitor.js', code)
console.log('Archivo de visitor generado correctamente')