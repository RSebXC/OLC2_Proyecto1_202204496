import { builtins } from "./builtins.js";
import { registers as r } from "./constantes.js";
import { stringTo32BitsArray, stringTo1ByteArray , numberToF32} from "./utils.js";

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
        this._labelCounter = 0;
        this._usedBuiltins = new Set()
        this.instrucciones = []
        this.objectStack = []
        this.breakStack = []
        this.continueStack = []
        this.depth = 0

    }

    move(rd, rs) {
        this.instrucciones.push(new Instruction('mv', rd, rs))
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

    la(rd, label) {
        this.instrucciones.push(new Instruction('la', rd, label))
    }

    // Mayor o igual ( >= )
    sge(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('slt', rd, rs1, rs2)); // Comparar rs1 < rs2
        this.instrucciones.push(new Instruction('seqz', rd, rd)); // Invertir el resultado
    }

    xor(rd, rs1, rs2) { // XOR lógico
        this.instrucciones.push(new Instruction('xor', rd, rs1, rs2));
    }

    xori(rd, rs1, inmediato) { // XOR lógico con inmediato
        this.instrucciones.push(new Instruction('xori', rd, rs1, inmediato));
    }

    sb (rs1, rs2, inmediato = 0) {
        this.instrucciones.push(new Instruction('sb', rs1, `${inmediato}(${rs2})`))
    }

    // Menor que ( < )
    slt(rd, rs1, rs2) { 
        this.instrucciones.push(new Instruction('slt', rd, rs1, rs2));
    }

    bgt (rs1, rs2, label) {
        this.instrucciones.push(new Instruction('bgt', rs1, rs2, label));
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

    pushFloat(rd = r.FT0) {
        this.addi(r.SP, r.SP, -4) // 4 bytes = 32 bits
        this.fsw(rd, r.SP)
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

    flw(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('flw', rd, `${inmediato}(${rs1})`))
    }

    lui(rd, inmediato) {
        this.instrucciones.push(new Instruction('lui', rd, inmediato))
    }

    printBool(rd = r.A0) {
        if (rd !== r.A0) {
            this.push(r.A0)
            this.add(r.A0, rd, r.ZERO)
        }

        const falseLabel = this.getLabel()
        const endLabel = this.getLabel()

        this.beqz(r.A0, falseLabel)

        // Imprimir "true"
        this.la(r.A0, 'truee')
        this.li(r.A7, 4)
        this.ecall()
        this.j(endLabel)

         // Imprimir false
        this.addLabel(falseLabel)
        this.la(r.A0, 'falsee')
        this.li(r.A7, 4)
        this.ecall()

        this.addLabel(endLabel)

        if (rd !== r.A0) {
            this.pop(r.A0)
        }


    }

    printFloat() {
        this.li(r.A7, 2)
        this.ecall()
    }

    printChar(rd = r.A0) {
        if (rd !== r.A0) {
            this.mv (r.A0, rd)
        }

        this.andi(r.A0, r.A0, 0xFF)
        this.li(r.A7, 11)
        this.ecall()
        

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

    bne (rs1, rs2, label) {
        this.instrucciones.push(new Instruction('bne', rs1, rs2, label));
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

    flt (rs1, rs2, label) {
        this.instrucciones.push(new Instruction('flt.s', rs1, rs2, label));
    }

    fle (rs1, rs2, label) {
        this.instrucciones.push(new Instruction('fle.s', rs1, rs2, label));
    }

    feq (rs1, rs2, label) {
        this.instrucciones.push(new Instruction('feq', rs1, rs2, label));
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

    andi(rd, rs1, inmediato) {
        this.instrucciones.push(new Instruction('andi', rd, rs1, inmediato));
    }


    // Manejar el salto condicional al "default"
    defaultJump(label) {
        this.instrucciones.push(new Instruction('j', label));
    }
    

    pushConstant(object) {
        let length = 0;

        switch (object.type) {
            case 'int':
                this.li(r.T0, object.valor !== undefined ? object.valor : 0);
                this.push()
                length = 4;
                break;

                case 'string':
                    const stringArray = stringTo1ByteArray(object.valor || "");

                this.comment(`Pushing string ${object.valor || "null"}`);
                // this.addi(r.T0, r.HP, 4);
                // this.push(r.T0);
                this.push(r.HP);

                stringArray.forEach((charCode) => {
                    this.li(r.T0, charCode);
                    // this.push(r.T0);
                    // this.addi(r.HP, r.HP, 4);
                    // this.sw(r.T0, r.HP);

                    this.sb(r.T0, r.HP);
                    this.addi(r.HP, r.HP, 1);
                });

                length = 4;
                break;
            case 'bool':
                this.li(r.T0, object.valor !== undefined ? (object.valor ? 1 : 0) : 0);
                this.push()
                length = 4;
                break;
            case 'float':
                const ieee754 = numberToF32(object.valor);
                this.li(r.T0, ieee754);
                this.push(r.T0);
                length = 4;
                break;

            case 'char':

                this.li(r.T0, object.valor !== undefined ? object.valor.charCodeAt(0) : 0);
                this.push(r.T0)
                length = 4;
                break;
            default:
                break;
        }

        this.pushObject({ type: object.type, length, depth: this.depth });
    }

    pushObject(object) {
        // this.objectStack.push(object);
        this.objectStack.push({
            ...object,
            depth: this.depth,
        });
    }

    popFloat(rd = r.FT0) {
        this.flw(rd, r.SP)
        this.addi(r.SP, r.SP, 4)
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
            case 'boolean':
                this.pop(rd);
                break;
            case 'float':
                this.popFloat(rd);
                break;
            case 'char':
                this.pop(rd);
                break;
            default:
                break;
        }

        return object;
    }


    getTopObject() {
        return this.objectStack[this.objectStack.length - 1];
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

    getBreakLabel() {
        return this.breakStack[this.breakStack.length - 1];
    }

    getContinueLabel() {
        return this.continueStack[this.continueStack.length - 1];
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
        // Comentario final del programa
        this.comment('Fin del programa')
        this.endProgram()
    
        // Agregar Builtins usados
        this.comment('Builtins')
        Array.from(this._usedBuiltins).forEach(builtinName => {
            this.addLabel(builtinName)
            builtins[builtinName](this)
            this.ret()
        })
    
        // Retornar la representación en string del programa ensamblado
        return `
    .data
        truee: .string "truee"
        falsee: .string "falsee"
        heap:     # Zona de memoria para el heap
    
    .text
    
    # Inicializar puntero del heap
        la ${r.HP}, heap
    
    main:
        ${this.instrucciones.map(instruccion => `${instruccion}`).join('\n')}
    `
    }
    



    // --- Instruciones flotantes

    fadd(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fadd.s', rd, rs1, rs2))
    }

    fsub(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fsub.s', rd, rs1, rs2))
    }

    fmul(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fmul.s', rd, rs1, rs2))
    }

    fdiv(rd, rs1, rs2) {
        this.instrucciones.push(new Instruction('fdiv.s', rd, rs1, rs2))
    }

    fli(rd, inmediato) {
        this.instrucciones.push(new Instruction('fli.s', rd, inmediato))
    }

    fmv(rd, rs1) {
        this.instrucciones.push(new Instruction('fmv.s', rd, rs1))
    }

    flw(rd, rs1, inmediato = 0) {
        this.instrucciones.push(new Instruction('flw', rd, `${inmediato}(${rs1})`))
    }

    fsw(rs1, rs2, inmediato = 0) {
        this.instrucciones.push(new Instruction('fsw', rs1, `${inmediato}(${rs2})`))
    }

    fmvs(rd, rs1) {
        this.instrucciones.push(new Instruction('fmv.s', rd, rs1))
    }

    fcvtws(rd, rs1) {
        this.instrucciones.push(new Instruction('fcvt.w.s', rd, rs1))
    }

    jr(rs) {
        this.instrucciones.push(new Instruction('jr', rs))
    }

    fcvtsw(rd, rs1) {
        this.instrucciones.push(new Instruction('fcvt.s.w', rd, rs1))
    }

    getFrameLocal(index) {
        const frameRelativeLocal = this.objectStack.filter(obj => obj.type === 'local');
        return frameRelativeLocal[index];
    }
}

