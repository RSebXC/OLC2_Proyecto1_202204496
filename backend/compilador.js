import { registers as r } from "./risc/constantes.js";
import { Generador } from "./risc/generador.js";
import { BaseVisitor } from "./visitor.js";
import { Instruction } from "./risc/generador.js";


export class CompilerVisitor extends BaseVisitor {
    constructor() {
        super();
        this.code = new Generador();
    }

    /**
     * @type {BaseVisitor['visitExpresionStmt']}
     */
    visitExpresionStmt(node) {
        node.exp.accept(this);
        this.code.popObject(r.T0);
    }

    /**
     * @type {BaseVisitor['visitPrimitivo']}
     */
    visitDato(node) {
        this.code.comment(`Primitivo: ${node.valor}`);
        let valor = node.valor.replace(/\\n/g, '\n')
                              .replace(/\\t/g, '\t')
                              .replace(/\\r/g, '\r')
                              .replace(/\\"/g, '"')
                              .replace(/\\\\/g, '\\');
        if (node.tipo === 'bool') {
            this.code.pushContant({ type: 'int', valor: node.valor ? 1 : 0 });
        } else {
        this.code.pushContant({ type: node.tipo, valor: node.valor });
        }
        this.code.comment(`Fin Primitivo: ${node.valor}`);
    }

    /**
     * @type {BaseVisitor['visitOperacionBinaria']}
     */
    visitOperacionBinaria(node) {
        // Modificaciones para agregar += y -=
        if (node.op === '+=') {
            node.izq.accept(this); // lado izquierdo
            this.code.popObject(r.T1); // carga el valor de la variable
            node.der.accept(this); // lado derecho (valor a sumar)
            this.code.popObject(r.T0); // extrae el valor
            this.code.add(r.T1, r.T1, r.T0); // suma el valor
            this.code.push(r.T1);
            return;
        }

        if (node.op === '-=') {
            node.izq.accept(this);
            this.code.popObject(r.T1);
            node.der.accept(this);
            this.code.popObject(r.T0);
            this.code.sub(r.T1, r.T1, r.T0); // resta el valor
            this.code.push(r.T1);
            return;
        }

        // Operadores lógicos
        if (node.op === '&&' || node.op === '||') {
            const labelEnd = this.code.getLabel();
            const labelElse = this.code.getLabel();
            node.izq.accept(this);
            this.code.popObject(r.T0);

            if (node.op === '&&') this.code.beq(r.T0, r.ZERO, labelElse);
            if (node.op === '||') this.code.bne(r.T0, r.ZERO, labelEnd);

            node.der.accept(this);
            this.code.popObject(r.T0);
            this.code.beq(r.T0, r.ZERO, labelElse);
            this.code.li(r.T0, node.op === '&&' ? 1 : 0);
            this.code.push(r.T0);
            this.code.j(labelEnd);
            this.code.addLabel(labelElse);
            this.code.li(r.T0, node.op === '&&' ? 0 : 1);
            this.code.push(r.T0);
            this.code.addLabel(labelEnd);
            return;
        }

        node.izq.accept(this);
        node.der.accept(this);
        const der = this.code.popObject(r.T0);
        const izq = this.code.popObject(r.T1);

        if (izq.type === 'string' && der.type === 'string') {
            this.code.add(r.A0, r.ZERO, r.T1);
            this.code.add(r.A1, r.ZERO, r.T0);
            this.code.callBuiltin('concatString');
            this.code.pushObject({ type: 'string', length: 4 });
            return;
        }

    
        switch (node.op) {
            case '+':
                if (valueObject1.type === 'string' && valueObject2.type === 'string') {
                    this.code.concatStrings(r.T1, r.T0, r.T0); // Concatenar los dos strings
                } else {
                    this.code.add(r.T0, r.T1, r.T0); // Si son enteros, suma normal
                }
                break;
            case '-':
                this.code.sub(r.T0, r.T1, r.T0);
                break;
            case '*':
                this.code.mul(r.T0, r.T1, r.T0);
                break;
            case '/':
                this.code.div(r.T0, r.T1, r.T0);
                break;
            case '%':
                this.code.rem(r.T0, r.T1, r.T0);
                break;
    
            // Comparaciones
            case '==':
                this.code.seqz(r.T0, r.T0); // Igual
                break;
            case '!=':
                this.code.snez(r.T0, r.T0); // Desigual
                break;
            case '<':
                this.code.slt(r.T0, r.T1, r.T0); // Menor
                break;
            case '>':
                this.code.slt(r.T0, r.T0, r.T1); // Mayor
                break;
            case '<=':
                this.code.sge(r.T0, r.T1, r.T0); // Menor o igual
                break;
            case '>=':
                this.code.sle(r.T0, r.T0, r.T1); // Mayor o igual
                break;
        }
    
        this.code.push(r.T0);
        this.code.pushObject({ type: 'int', length: 4 });
    }
    
    

    /**
     * @type {BaseVisitor['visitOperacionUnaria']}
     */
    // Operaciones unarias
    visitOperacionUnaria(node) {
        node.exp.accept(this);
        this.code.popObject(r.T0);
        switch (node.op) {
            case '-':
                this.code.li(r.T1, 0);
                this.code.sub(r.T0, r.T1, r.T0);
                break;
            case '!':
                this.code.li(r.T1, 1);
                this.code.sub(r.T0, r.T1, r.T0);
                break;
        }
        this.code.push(r.T0);
    }

    /**
     * @type {BaseVisitor['visitAgrupacion']}
     */
    visitAgrupacion(node) {
        return node.exp.accept(this);
    }

    visitPrint(node) {
        this.code.comment('Print');
        node.exp.forEach(e => {
            e.accept(this);
            const object = this.code.popObject(r.A0);
            const tipoPrint = {
                'int': () => this.code.printInt(),
                'string': () => this.code.printString(),
                'bool': () => this.code.printBool(),
            }
            tipoPrint[object.type]();
        });
    }

    /**
     * @type {BaseVisitor['visitDeclaracionVariable']}
     */
    visitDeclaracionVariable(node) {
        this.code.comment(`Declaracion Variable: ${node.id}`);


        node.exp.accept(this);
        this.code.tagObject(node.id);

        this.code.comment(`Fin declaracion Variable: ${node.id}`);
    }

    /**
     * @type {BaseVisitor['visitAsignacion']}
     */
    visitAsignacion(node) {
        this.code.comment(`Asignacion Variable: ${node.id}`);

        node.asgn.accept(this);
        const valueObject = this.code.popObject(r.T0);
        const [offset, variableObject] = this.code.getObject(node.id);

        this.code.addi(r.T1, r.SP, offset);
        this.code.sw(r.T0, r.T1);

        variableObject.type = valueObject.type;

        this.code.push(r.T0);
        this.code.pushObject(valueObject);

        this.code.comment(`Fin Asignacion Variable: ${node.id}`);
    }


    /**
     * @type {BaseVisitor['visitReferenciaVariable']}
     */
    visitReferenciaVariable(node) {
        this.code.comment(`Referencia a variable ${node.id}: ${JSON.stringify(this.code.objectStack)}`);


        const [offset, variableObject] = this.code.getObject(node.id);
        this.code.addi(r.T0, r.SP, offset);
        this.code.lw(r.T1, r.T0);
        this.code.push(r.T1);
        this.code.pushObject({ ...variableObject, id: undefined });

        // this.code.comment(`Fin Referencia Variable: ${node.id}`);
        this.code.comment(`Fin referencia de variable ${node.id}: ${JSON.stringify(this.code.objectStack)}`);
    }


    /**
     * @type {BaseVisitor['visitBloque']}
     */
    visitBloque(node) {
        this.code.comment('Inicio de bloque');

        this.code.newScope();

        node.dcls.forEach(d => d.accept(this));

        this.code.comment('Reduciendo la pila');
        const bytesToRemove = this.code.endScope();

        if (bytesToRemove > 0) {
            this.code.addi(r.SP, r.SP, bytesToRemove);
        }

        this.code.comment('Fin de bloque');
    }

    
    visitIf(node) {
        this.code.comment('If statement');
        
        // Evaluar la condición
        node.cond.accept(this);
        this.code.popObject(r.T0);
    
        // Crear etiquetas para las ramas y el final
        const labelElse = `else_${this.code.instrucciones.length}`;
        const labelEnd = `end_if_${this.code.instrucciones.length}`;
        
        // Saltar a la rama 'else' si la condición es falsa (T0 == 0)
        this.code.instrucciones.push(new Instruction('beqz', r.T0, labelElse));
    
        // Instrucciones del bloque 'if' verdadero
        node.stmtTrue.accept(this);
    
        // Saltar al final si la condición era verdadera
        this.code.instrucciones.push(new Instruction('j', labelEnd));
    
        // Instrucciones del bloque 'else if'
        if (node.stmtElseIf) {
            node.stmtElseIf.forEach((elseIfNode, index) => {
                const labelElseIf = `else_if_${index}_${this.code.instrucciones.length}`;
                this.code.instrucciones.push(new Instruction(`${labelElseIf}:`));
                elseIfNode.accept(this);
            });
        }
    
        // Etiqueta 'else'
        this.code.instrucciones.push(new Instruction(`${labelElse}:`));
        if (node.stmtFalse) {
            node.stmtFalse.accept(this);
        }
    
        // Etiqueta final
        this.code.instrucciones.push(new Instruction(`${labelEnd}:`));
    }
    

    visitWhile(node) {
        this.code.comment('While loop');
    
        // Crear etiquetas para el inicio y final del ciclo
        const labelStart = `while_${this.code.instrucciones.length}`;
        const labelEnd = `end_while_${this.code.instrucciones.length}`;
        
        // Etiqueta para el inicio del ciclo
        this.code.instrucciones.push(new Instruction(`${labelStart}:`));
    
        // Evaluar la condición
        node.cond.accept(this);
        this.code.popObject(r.T0);
    
        // Saltar al final si la condición es falsa (T0 == 0)
        this.code.instrucciones.push(new Instruction('beqz', r.T0, labelEnd));
    
        // Ejecutar el cuerpo del ciclo
        node.stmt.accept(this);
    
        // Saltar de vuelta al inicio del ciclo
        this.code.instrucciones.push(new Instruction('j', labelStart));
    
        // Etiqueta final del ciclo
        this.code.instrucciones.push(new Instruction(`${labelEnd}:`));
    }

    
    visitFor(node) {
        this.code.comment('For loop');
        
        // Inicialización
        if (node.init) {
            node.init.accept(this);
        }
    
        // Crear etiquetas para ciclo
        const labelStart = `for_${this.code.instrucciones.length}`;
        const labelEnd = `end_for_${this.code.instrucciones.length}`;
    
        this.code.instrucciones.push(new Instruction(`${labelStart}:`));
    
        // Condición
        if (node.cond) {
            node.cond.accept(this);
            this.code.popObject(r.T0);
    
            this.code.instrucciones.push(new Instruction('beqz', r.T0, labelEnd));
        }
    
        // Cuerpo del ciclo
        node.stmt.accept(this);
    
        // Incremento
        if (node.inc) {
            node.inc.accept(this);
        }
    
        this.code.instrucciones.push(new Instruction('j', labelStart));
    
        this.code.instrucciones.push(new Instruction(`${labelEnd}:`));
    }
    

    
    visitSwitch(node) {
        // Evaluar la expresión del switch
        node.exp.accept(this);
        this.code.popObject(r.T0);

        // Crear etiquetas para los casos y el default
        const defaultLabel = this.code.createLabel('default');
        const endLabel = this.code.createLabel('end_switch');
        const caseLabels = node.cases.map(() => this.code.createLabel('case'));

        // Generar comparaciones para cada case
        node.cases.forEach((caseNode, index) => {
            // Valor del case a comparar
            caseNode.value.accept(this);
            this.code.popObject(r.T1);

            // Comparar el valor de la expresión del switch con el valor del case
            this.code.beq(r.T0, r.T1, caseLabels[index]);
        });

        // Si no se cumple ningún case, saltar al default
        this.code.defaultJump(defaultLabel);

        // Generar el código para cada case
        node.cases.forEach((caseNode, index) => {
            this.code.addLabel(caseLabels[index]);
            caseNode.stmt.accept(this);
            this.code.defaultJump(endLabel); // Saltar al final después de ejecutar el case
        });

        // Generar el código para el default, si existe
        this.code.addLabel(defaultLabel);
        if (node.defaultStmt) {
            node.defaultStmt.accept(this);
        }

        // Etiqueta de fin del switch
        this.code.addLabel(endLabel);
    }

    concatStrings(rd, rs1, rs2) {
        this.comment('Concatenating two strings');
    
        // Copiar primera cadena
        this.loopCopy(rs1, r.HP); // Copiar la primera cadena al heap
    
        // Copiar segunda cadena inmediatamente después de la primera
        this.loopCopy(rs2, r.HP); // Continuar la copia desde donde se dejó la primera
    
        this.push(rd); // Guardar la dirección del resultado concatenado
    }
    
    
    loopCopy(rs, dest) {
        this.comment(`Copying string from ${rs} to ${dest}`);
        
        const loopLabel = this.createLabel("loop_copy"); // Crear una etiqueta para el bucle
        const endLabel = this.createLabel("end_copy");   // Crear una etiqueta para el final del bucle
    
        // Copiar la cadena byte a byte
        this.addLabel(loopLabel);
    
        // Cargar el byte desde la dirección de origen (rs)
        this.lw(r.T1, rs, 0); // T1 = *rs
        this.beqz(r.T1, endLabel); // Si es el byte final (cero), salir del bucle
    
        // Guardar el byte en el destino (dest)
        this.sw(r.T1, dest, 0); // *dest = T1
    
        // Incrementar las direcciones de origen y destino
        this.addi(rs, rs, 4);   // Avanzar el puntero de origen (rs)
        this.addi(dest, dest, 4); // Avanzar el puntero de destino (heap)
    
        // Saltar al inicio del bucle para continuar copiando
        this.j(loopLabel);
    
        // Etiqueta para el final del bucle de copia
        this.addLabel(endLabel);
    }
    
    

}