import { registers as r } from "./constantes.js"
import { Generador } from "./generador.js"


/**
 * @param {Generador} code
 */
export const concatString = (code) => {
    // A0 -> dirección en heap de la primera cadena
    // A1 -> dirección en heap de la segunda cadena
    // result -> push en el stack la dirección en heap de la cadena concatenada

    code.comment('Guardando en el stack la dirección en heap de la cadena concatenada');
    code.push(r.HP);

    code.comment('Copiando la 1er cadena en el heap');
    const end1 = code.getLabel();
    const loop1 = code.addLabel();

    code.lb(r.T1, r.A0);
    code.beq(r.T1, r.ZERO, end1);
    code.sb(r.T1, r.HP);
    code.addi(r.HP, r.HP, 1);
    code.addi(r.A0, r.A0, 1);
    code.j(loop1);
    code.addLabel(end1);

    code.comment('Copiando la 2da cadena en el heap');
    const end2 = code.getLabel();
    const loop2 = code.addLabel();

    code.lb(r.T1, r.A1);
    code.beq(r.T1, r.ZERO, end2);
    code.sb(r.T1, r.HP);
    code.addi(r.HP, r.HP, 1);
    code.addi(r.A1, r.A1, 1);
    code.j(loop2);
    code.addLabel(end2);

    code.comment('Agregando el caracter nulo al final');
    code.sb(r.ZERO, r.HP);
    code.addi(r.HP, r.HP, 1);

    // Aquí agregamos la impresión de la cadena concatenada
    code.comment('Imprimiendo la cadena concatenada');
    code.pop(r.A0);  // Recuperar la dirección de la cadena concatenada desde el stack
    code.printString();  // Imprimir la cadena
}



export const parseIntBuiltin = (code) => {
    code.comment('Convirtiendo cadena a entero');
    const endParse = code.getLabel();

    // Inicializa el resultado como 0
    code.li(r.T2, 0); // T2 será el acumulador del resultado

    // Guardar la dirección original para restaurar
    code.push(r.A0);

    // Recorre cada carácter en la cadena
    const loop = code.addLabel();
    code.lb(r.T1, r.A0);   // Cargar el byte actual de la cadena
    code.beq(r.T1, r.ZERO, endParse); // Termina si es el carácter nulo

    // Si el carácter es un dígito (entre '0' y '9')
    code.li(r.T3, '0'.charCodeAt(0)); // Cargar '0'
    code.li(r.T4, '9'.charCodeAt(0)); // Cargar '9'
    code.blt(r.T1, r.T3, endParse);   // Si el carácter es menor que '0', terminar
    code.bgt(r.T1, r.T4, endParse);   // Si el carácter es mayor que '9', terminar

    // Convierte el carácter a su valor numérico
    code.sub(r.T1, r.T1, r.T3); // T1 = T1 - '0'

    // Acumula el valor en el resultado
    code.mul(r.T2, r.T2, 10); // T2 = T2 * 10
    code.add(r.T2, r.T2, r.T1); // T2 += T1

    // Avanza al siguiente carácter en la cadena
    code.addi(r.A0, r.A0, 1);
    code.j(loop);
    
    code.addLabel(endParse);
    // Restaurar la dirección original en A0
    code.pop(r.A0);
    // Devolver el entero parseado en A0
    code.move(r.A0, r.T2);
}



export const toStringBuiltin = (code) => {
    code.comment('Convirtiendo entero a cadena');
    const endToString = code.getLabel();
    const isNegative = code.getLabel();

    code.li(r.T2, 10);  // T2 = 10 para las divisiones
    code.move(r.T3, r.A0); // Guardar el valor original en T3
    code.bltz(r.A0, isNegative); // Si es negativo, manejarlo

    // Guardar la posición actual en el heap
    code.push(r.HP);

    // Si es positivo, convertir a string
    const loop = code.addLabel();
    code.divu(r.T4, r.T3, r.T2); // T4 = T3 / 10
    code.mfhi(r.T1);  // T1 = T3 % 10
    code.addi(r.T1, r.T1, '0'.charCodeAt(0));  // Convertir a carácter
    code.sb(r.T1, r.HP);  // Guardar en el heap
    code.addi(r.HP, r.HP, 1); // Incrementar el heap
    code.move(r.T3, r.T4);  // Actualizar T3
    code.bnez(r.T3, loop);  // Continuar hasta que T3 sea 0

    code.j(endToString); // Saltar al final si no es negativo

    code.addLabel(isNegative);
    code.comment('Si el número es negativo');
    code.neg(r.T3, r.A0);  // Convertir el número a positivo
    code.sb('-'.charCodeAt(0), r.HP);  // Agregar el signo negativo en el heap
    code.addi(r.HP, r.HP, 1); // Incrementar el heap

    code.addLabel(endToString);
    // Agregar el carácter nulo al final
    code.sb(r.ZERO, r.HP);
    code.addi(r.HP, r.HP, 1);
}


export const parseFloatBuiltin = (code) => {
    code.comment('Convirtiendo cadena a float');
    const endParse = code.getLabel();
    const decimalPart = code.getLabel();
    const loop = code.addLabel();

    // Inicializa el resultado y el factor para decimales
    code.li(r.T2, 0); // T2 será el acumulador del resultado
    code.li(r.T5, 1); // T5 será el factor para los decimales

    // Guardar la dirección original
    code.push(r.A0);

    // Recorre cada carácter en la cadena
    code.addLabel(loop);
    code.lb(r.T1, r.A0);   // Cargar el byte actual de la cadena
    code.beq(r.T1, r.ZERO, endParse); // Termina si es el carácter nulo

    // Si es un punto decimal
    code.li(r.T4, '.'.charCodeAt(0));
    code.beq(r.T1, r.T4, decimalPart);

    // Convertir carácter a su valor numérico
    code.li(r.T3, '0'.charCodeAt(0));
    code.sub(r.T1, r.T1, r.T3);
    code.mul(r.T2, r.T2, 10);
    code.add(r.T2, r.T2, r.T1);

    // Avanza al siguiente carácter
    code.addi(r.A0, r.A0, 1);
    code.j(loop);

    // Manejar la parte decimal
    code.addLabel(decimalPart);
    code.addi(r.A0, r.A0, 1);
    const decimalLoop = code.addLabel();
    code.lb(r.T1, r.A0);
    code.beq(r.T1, r.ZERO, endParse);

    // Convertir carácter a su valor numérico
    code.sub(r.T1, r.T1, r.T3);
    code.mul(r.T5, r.T5, 10);
    code.div(r.T1, r.T1, r.T5);
    code.add(r.T2, r.T2, r.T1);

    // Avanza al siguiente carácter
    code.addi(r.A0, r.A0, 1);
    code.j(decimalLoop);

    code.addLabel(endParse);
    code.pop(r.A0);
    code.move(r.A0, r.T2);
}


export const upperCaseBuiltin = (code) => {
    code.comment('Convirtiendo cadena a mayúsculas');
    code.push(r.HP)
    const endUpper = code.getLabel();
    const sinConvertir = code.getLabel();
    const loop = code.addLabel();
    const Convertir = code.getLabel();
    const siguienteLetra = code.getLabel();
    code.lb(r.T1, r.A0);  // Leer el byte actual
    code.beq(r.T1, r.ZERO, endUpper);  // Terminar si es el carácter nulo

    code.li(r.T2, 97);  // 'a' en ASCII
    code.li(r.T3, 122);  // 'z' en ASCII
    code.blt(r.T1, r.T2, sinConvertir);  // Si es menor que 'a', continuar
    code.bgt(r.T1, r.T3, sinConvertir);  // Si es mayor que 'z', continuar
    code.j(Convertir);
    code.addLabel(sinConvertir);
    code.sb(r.T1, r.HP);  // Guardar el carácter sin convertir en el heap
    code.addLabel(siguienteLetra);
    code.addi(r.HP, r.HP, 1);  // Avanzar al siguiente caracter
    code.addi(r.A0, r.A0, 1);
    code.j(loop);
    code.addLabel(Convertir);
    code.addi(r.T1, r.T1, -32);  // Convertir a mayúscula
    code.sb(r.T1, r.HP);  // Guardar el carácter convertido en el heap
    code.j(siguienteLetra);
    code.addLabel(endUpper);
    code.sb(r.ZERO, r.HP);  // Agregar el carácter nulo al final
    code.addi(r.HP, r.HP, 1);
}


export const lowerCaseBuiltin = (code) => {
    code.comment('Convirtiendo cadena a minúsculas');
    code.push(r.HP)
    const endLower = code.getLabel();
    const sinConvertir = code.getLabel();
    const loop = code.addLabel();
    const Convertir = code.getLabel();
    const siguienteLetra = code.getLabel();
    code.lb(r.T1, r.A0);  // Leer el byte actual
    code.beq(r.T1, r.ZERO, endLower);  // Terminar si es el carácter nulo

    code.li(r.T2, 65);  // 'A' en ASCII
    code.li(r.T3, 90);  // 'Z' en ASCII
    code.blt(r.T1, r.T2, sinConvertir);  // Si es menor que 'A', continuar
    code.bgt(r.T1, r.T3, sinConvertir);  // Si es mayor que 'Z', continuar
    code.j(Convertir);
    code.addLabel(sinConvertir);
    code.sb(r.T1, r.HP);  // Guardar el carácter sin convertir en el heap
    code.addLabel(siguienteLetra);
    code.addi(r.HP, r.HP, 1);  // Avanzar al siguiente caracter
    code.addi(r.A0, r.A0, 1);
    code.j(loop);
    code.addLabel(Convertir);
    code.addi(r.T1, r.T1, 32);  // Convertir a minúscula
    code.sb(r.T1, r.HP);  // Guardar el carácter convertido en el heap
    code.j(siguienteLetra);
    code.addLabel(endLower);
    code.sb(r.ZERO, r.HP);  // Agregar el carácter nulo al final
    code.addi(r.HP, r.HP, 1);
}



export const builtins = {
    concatString: concatString,
    
    parseIntBuiltin: parseIntBuiltin,
    toStringBuiltin: toStringBuiltin,
    upperCaseBuiltin: upperCaseBuiltin,
    lowerCaseBuiltin: lowerCaseBuiltin
}
