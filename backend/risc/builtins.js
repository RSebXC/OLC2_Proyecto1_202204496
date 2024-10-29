import { registers as r , floatRegisters as f} from "./constantes.js"
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

export const parseIntString = (code) => {
    code.comment('Convirtiendo string a integer');
    
    // Registros:
    // A0 -> dirección del string en heap
    // T0 -> resultado final
    // T1 -> caracter actual
    // T2 -> usado para cálculos temporales
    // T3 -> signo (-1 o 1)
    
    code.li(r.T0, 0);  // Inicializar resultado
    code.li(r.T3, 1);  // Inicializar signo como positivo
    
    // Verificar si el primer carácter es un signo
    code.lb(r.T1, r.A0);
    const noEsSigno = code.getLabel();
    const loop = code.getLabel();
    
    // Verificar si es signo negativo
    code.li(r.T2, 45);  // ASCII de '-'
    code.bne(r.T1, r.T2, noEsSigno);
    code.li(r.T3, -1);  // Cambiar signo a negativo
    code.addi(r.A0, r.A0, 1);  // Avanzar al siguiente caracter
    
    code.addLabel(noEsSigno);
    code.addLabel(loop);
    
    // Leer siguiente caracter
    code.lb(r.T1, r.A0);
    
    // Si es null (0), terminar
    const end = code.getLabel();
    code.beq(r.T1, r.ZERO, end);
    
    // Verificar si es dígito (entre ASCII 48-57)
    const noEsDigito = code.getLabel();
    code.li(r.T2, 48);  // ASCII de '0'
    code.blt(r.T1, r.T2, noEsDigito);
    code.li(r.T2, 57);  // ASCII de '9'
    code.bgt(r.T1, r.T2, noEsDigito);
    
    // Convertir ASCII a número
    code.addi(r.T1, r.T1, -48);
    
    // Multiplicar resultado actual por 10 y sumar nuevo dígito
    code.li(r.T2, 10);
    code.mul(r.T0, r.T0, r.T2);
    code.add(r.T0, r.T0, r.T1);
    
    code.addLabel(noEsDigito);
    code.addi(r.A0, r.A0, 1);  // Avanzar al siguiente caracter
    code.j(loop);
    
    code.addLabel(end);
    
    // Aplicar el signo al resultado
    code.mul(r.T0, r.T0, r.T3);
    
    // Guardar resultado en el stack
    code.push(r.T0);
}

export const parseIntFloat = (code) => {
    code.comment('Convirtiendo int a float');
    code.fmvs(f.FT0, f.FA0); //mover
    code.fcvtws(r.T0, f.FT0); //convertir a entero truncado
    code.push(r.T0); //push
    code.jr(r.RA); //llamar a la funcion printFloat
}

export const parseFloatString = (code) => {
    code.comment('Convirtiendo string a float');
    
    // Registros:
    // A0 -> dirección del string en heap
    // T0 -> parte entera del resultado
    // T1 -> caracter actual
    // T2 -> usado para cálculos temporales
    // T3 -> signo (-1 o 1)
    // T4 -> parte decimal del resultado
    // T5 -> divisor para parte decimal (0.1, 0.01, etc)
    
    code.li(r.T0, 0);  // Inicializar parte entera
    code.li(r.T4, 0);  // Inicializar parte decimal
    code.li(r.T3, 1);  // Inicializar signo como positivo
    code.li(r.T5, 1);  // Inicializar divisor
    
    // Verificar si el primer carácter es un signo
    code.lb(r.T1, r.A0);
    const noEsSigno = code.getLabel();
    const parteDecimal = code.getLabel();
    const loop = code.getLabel();
    
    // Verificar si es signo negativo
    code.li(r.T2, 45);  // ASCII de '-'
    code.bne(r.T1, r.T2, noEsSigno);
    code.li(r.T3, -1);  // Cambiar signo a negativo
    code.addi(r.A0, r.A0, 1);  // Avanzar al siguiente caracter
    
    code.addLabel(noEsSigno);
    code.addLabel(loop);
    
    // Leer siguiente caracter
    code.lb(r.T1, r.A0);
    
    // Si es null (0), terminar
    const end = code.getLabel();
    code.beq(r.T1, r.ZERO, end);
    
    // Verificar si es punto decimal
    code.li(r.T2, 46);  // ASCII de '.'
    code.beq(r.T1, r.T2, parteDecimal);
    
    // Verificar si es dígito (entre ASCII 48-57)
    const noEsDigito = code.getLabel();
    code.li(r.T2, 48);  // ASCII de '0'
    code.blt(r.T1, r.T2, noEsDigito);
    code.li(r.T2, 57);  // ASCII de '9'
    code.bgt(r.T1, r.T2, noEsDigito);
    
    // Convertir ASCII a número
    code.addi(r.T1, r.T1, -48);
    
    // Multiplicar resultado actual por 10 y sumar nuevo dígito
    code.li(r.T2, 10);
    code.mul(r.T0, r.T0, r.T2);
    code.add(r.T0, r.T0, r.T1);
    
    code.addLabel(noEsDigito);
    code.addi(r.A0, r.A0, 1);  // Avanzar al siguiente caracter
    code.j(loop);
    
    // Procesar parte decimal
    code.addLabel(parteDecimal);
    code.addi(r.A0, r.A0, 1);  // Saltar el punto decimal
    
    const loopDecimal = code.addLabel();
    code.lb(r.T1, r.A0);
    code.beq(r.T1, r.ZERO, end);
    
    // Verificar si es dígito
    const noEsDigitoDecimal = code.getLabel();
    code.li(r.T2, 48);  // ASCII de '0'
    code.blt(r.T1, r.T2, noEsDigitoDecimal);
    code.li(r.T2, 57);  // ASCII de '9'
    code.bgt(r.T1, r.T2, noEsDigitoDecimal);
    
    // Convertir ASCII a número
    code.addi(r.T1, r.T1, -48);
    
    // Multiplicar T5 por 10 (siguiente posición decimal)
    code.li(r.T2, 10);
    code.mul(r.T5, r.T5, r.T2);
    
    // Agregar el dígito decimal al resultado
    code.mul(r.T2, r.T1, r.T5);  // Multiplicar dígito por la potencia de 10
    code.add(r.T4, r.T4, r.T2);  // Agregar a la parte decimal
    
    code.addLabel(noEsDigitoDecimal);
    code.addi(r.A0, r.A0, 1);  // Avanzar al siguiente caracter
    code.j(loopDecimal);
    
    code.addLabel(end);
    
    // Combinar parte entera y decimal
    code.div(r.T4, r.T4, r.T5);  // Dividir parte decimal por el divisor
    code.add(r.T0, r.T0, r.T4);  // Sumar parte decimal al resultado
    
    // Aplicar el signo al resultado
    code.mul(r.T0, r.T0, r.T3);
    
    // Guardar resultado en el stack
    code.push(r.T0);
}

export const parseFloatInt = (code) => {
    code.comment('Convirtiendo entero a float');
    code.fmv_w_x(r.FT0, r.T0); //mover
    code.fcvt_s_w(r.FA0, r.FT0); //convertir a float
    code.push(r.FA0); //push
    code.jr('printFloat'); //llamar a la funcion printFloat
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


export const lessOrEqual = (code) => {
    // t1: left operand
    // t0 -> right operand

    /*
    if (left <= right) {
        t0 = 1
        push t0
    } else {
        t0 = 0
        push t0
    }
    */
    const trueLabel = code.getLabel()
    const endLabel = code.getLabel()

    code.bge(r.T0, r.T1, trueLabel) // der >= izq
    code.li(r.T0, 0)
    code.push(r.T0)
    code.j(endLabel)
    code.addLabel(trueLabel)
    code.li(r.T0, 1)
    code.push(r.T0)
    code.addLabel(endLabel)
}


export const builtins = {
    concatString: concatString,
    parseIntFloat: parseIntFloat,
    parseFloatInt: parseFloatInt,
    parseIntString: parseIntString,
    parseFloatString: parseFloatString,
    upperCaseBuiltin: upperCaseBuiltin,
    lowerCaseBuiltin: lowerCaseBuiltin,
    lessOrEqual: lessOrEqual
}
