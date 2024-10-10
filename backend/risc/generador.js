import { builtins } from "./builtins.js";
import { registers as r } from "./constantes.js";
import { stringTo32BitsArray } from "./utils.js";

export class Instruction {

    constructor(instruccion, rd, rs1, rs2) {
        this.instruccion = instruccion;
        this.rd = rd;
        this.rs1 = rs1;
        this.rs2 = rs2;
    }

    toString() {
        const operandos = []
        if (this.rd !== undefined) operandos.push(this.rd)
        if (this.rs1 !== undefined) operandos.push(this.rs1)
        if (this.rs2 !== undefined) operandos.push(this.rs2)
        return `${this.instruccion} ${operandos.join(', ')}`
    }

}

export class Generador {

    constructor() {
        this.instrucciones = []
        this.objectStack = []
        this.depth = 0

    }

    getLabel() {
        return `L${this._labelCounter++}`
    }

    add(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('add', rd, rs1, rs2))
    }

    sub(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('sub', rd, rs1, rs2))
    }

    mul(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('mul', rd, rs1, rs2))
    }

    div(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('div', rd, rs1, rs2))
    }

    addi(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('addi', rd, rs1, inmediato))
    }

        // Instrucciones comparativas en el generador
    seqz(rd, rs) { // Igualdad: rd = (rs == 0) ? 1 : 0
        this.instrucciones.push(new Instruction('seqz', rd, rs));
    }

    snez(rd, rs) { // Desigualdad: rd = (rs != 0) ? 1 : 0
        this.instrucciones.push(new Instruction('snez', rd, rs));
    }

    // Menor o igual ( <= )
    sle(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('slt', rd, rs2, rs1)); // rs1 <= rs2 es equivalente a !(rs1 > rs2)
        this.instrucciones.push(new Instruction('seqz', rd, rd)); // Invertir el resultado
    }


    // Mayor o igual ( >= )
    sge(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('slt', rd, rs1, rs2)); // Comparar rs1 < rs2
        this.instrucciones.push(new Instruction('seqz', rd, rd)); // Invertir el resultado
    }

    sb (rs1, rs2, inmediato = 0) {
        this.instrucciones.push(new Instruction('sb', rs1, `${inmediato}(${rs2})`))
    }

    // Mayor que ( > )
    slt(rd, rs2, rs1) { 
        this.instrucciones.push(new Instruction('slt', rd, rs2, rs1));
    }


    // Menor que ( < )
    slt(rd, rs1, rs2) { 
        this.instrucciones.push(new Instruction('slt', rd, rs1, rs2));
    }


        // Operación lógica AND
    and(rd, rs1, rs2) { // AND lógico
        this.instrucciones.push(new Instruction('and', rd, rs1, rs2));
    }

    // Operación lógica OR
    or(rd, rs1, rs2) { // OR lógico
        this.instrucciones.push(new Instruction('or', rd, rs1, rs2));
    }

    sw(rs1, rs2, inmediato = 0) {
        this.instrucciones.push(new Instruction('sw', rs1, `${inmediato}(${rs2})`))
    }

    lw(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('lw', rd, `${inmediato}(${rs1})`))
    }

    lb(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('lb', rd, `${inmediato}(${rs1})`))
    }

    li(rd, inmediato) {
        this.instrucciones.push(new Instruction('li', rd, inmediato))
    }

    bge (rs1, rs2, label) {
        this.instrucciones.push(new Instruction('bge', rs1, rs2, label));
    }

    push(rd = r.T0) {
        this.addi(r.SP, r.SP, -4) // 4 bytes = 32 bits
        this.sw(rd, r.SP)
    }

    rem(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('rem', rd, rs1, rs2))
    }

    pop(rd = r.T0) {
        this.lw(rd, r.SP)
        this.addi(r.SP, r.SP, 4)
    }

    ecall() {
        this.instrucciones.push(new Instruction('ecall'))
    }

    callBuiltin(builtinName) {
        if (!builtins[builtinName]) {
            throw new Error(`Builtin ${builtinName} not found`)
        }
        this._usedBuiltins.add(builtinName)
        this.jal(builtinName)
    }

    printInt(rd = r.A0) {

        if (rd !== r.A0) {
            this.push(r.A0)
            this.add(r.A0, rd, r.ZERO)
        }

        this.li(r.A7, 1)
        this.ecall()

        if (rd !== r.A0) {
            this.pop(r.A0)
        }

    }

    printString(rd = r.A0) {

        if (rd !== r.A0) {
            this.push(r.A0)
            this.add(r.A0, rd, r.ZERO)
        }

        this.li(r.A7, 4)
        this.ecall()

        if (rd !== r.A0) {
            this.pop(r.A0)
        }
    }

    endProgram() {
        this.li(r.A7, 10)
        this.ecall()
    }

    comment(text) {
        this.instrucciones.push(new Instruction(`# ${text}`))
    }

    beqz(rs, label) {
        this.instrucciones.push(new Instruction('beqz', rs, label));
    }
    
    
    j(label) {
        this.instrucciones.push(new Instruction('j', label));
    }

    jal(label) {
        this.instrucciones.push(new Instruction('jal', label));
    }

    createLabel(prefix) {
        return `${prefix}_${this.instrucciones.length}`;
    }

    // Instrucción para comparar si un valor es igual a otro y saltar a una etiqueta si es cierto
    beq(rs1, rs2, label) {
        this.instrucciones.push(new Instruction('beq', rs1, rs2, label));
    }

    blt (rs1, rs2, label) {
        this.instrucciones.push(new Instruction('blt', rs1, rs2, label));
    }

    ret() {
        this.instrucciones.push(new Instruction('ret'));
    }

    // Instrucción para insertar una etiqueta en el código
    addLabel(label) {
        label = label || this.getLabel()
        this.instrucciones.push(new Instruction(`${label}:`))
        return label
    }

    // Manejar el salto condicional al "default"
    defaultJump(label) {
        this.instrucciones.push(new Instruction('j', label));
    }
    

    pushContant(object) {
        let length = 0;

        switch (object.type) {
            case 'int':
                this.li(r.T0, object.valor);
                this.push()
                length = 4;
                break;

                case 'string':
                    const stringArray = stringTo32BitsArray(object.valor);
                
                    this.comment(`Pushing string ${object.valor}`);
                    this.addi(r.T0, r.HP, 4); // Dirección inicial del heap
                    this.push(r.T0); // Pushear la dirección de la cadena al stack
                
                    stringArray.forEach((block32bits) => {
                        this.li(r.T0, block32bits);
                        this.addi(r.HP, r.HP, 4);
                        this.sw(r.T0, r.HP); // Almacenar cada bloque de la cadena en el heap
                    });
                
                    length = 4;
                    break;
                

            default:
                break;
        }

        this.pushObject({ type: object.type, length, depth: this.depth });
    }

    pushObject(object) {
        this.objectStack.push(object);
    }

    popObject(rd = r.T0) {
        const object = this.objectStack.pop();


        switch (object.type) {
            case 'int':
                this.pop(rd);
                break;

            case 'string':
                this.pop(rd);
                break;
            default:
                break;
        }

        return object;
    }

    /*
     FUNCIONES PARA ENTORNOS
    */

    newScope() {
        this.depth++
    }

    endScope() {
        let byteOffset = 0;

        for (let i = this.objectStack.length - 1; i >= 0; i--) {
            if (this.objectStack[i].depth === this.depth) {
                byteOffset += this.objectStack[i].length;
                this.objectStack.pop();
            } else {
                break;
            }
        }
        this.depth--

        return byteOffset;
    }


    tagObject(id) {
        this.objectStack[this.objectStack.length - 1].id = id;
    }

    getObject(id) {
        let byteOffset = 0;
        for (let i = this.objectStack.length - 1; i >= 0; i--) {
            if (this.objectStack[i].id === id) {
                return [byteOffset, this.objectStack[i]];
            }
            byteOffset += this.objectStack[i].length;
        }

        throw new Error(`Variable ${id} not found`);
    }

    toString() {
        this.comment('Fin del programa')
        this.endProgram()
        this.comment('Builtins')

        Array.from(this._usedBuiltins).forEach(builtinName => {
            this.addLabel(builtinName)
            builtins[builtinName](this)
            this.ret()
        })
        return `
.data
        heap:
.text

# inicializando el heap pointer
    la ${r.HP}, heap

main:
    ${this.instrucciones.map(instruccion => `${instruccion}`).join('\n')}
`
    }

}