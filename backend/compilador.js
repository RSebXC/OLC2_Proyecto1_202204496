import { registers as r, floatRegisters as f } from "./risc/constantes.js";
import { Generador } from "./risc/generador.js";
import { BaseVisitor } from "./visitor.js";

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
        if (node.tipo === 'bool') {
            this.code.pushConstant({ type: 'int', valor: node.valor ? 1 : 0 });
        } else {
        this.code.pushConstant({ type: node.tipo, valor: node.valor !== undefined ? node.valor : null });
        }
        this.code.comment(`Fin Primitivo: ${node.valor}`);
    }

    /**
     * @type {BaseVisitor['visitOperacionBinaria']}
     */
    visitOperacionBinaria(node) {
        this.code.comment(`Operacion Binaria: ${node.op}`);
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

        if (node.op === '&&') {
            node.izq.accept(this); // izq
            this.code.popObject(r.T0); // izq

            const labelFalse = this.code.getLabel();
            const labelEnd = this.code.getLabel();

            this.code.beq(r.T0, r.ZERO, labelFalse); // if (!izq) goto labelFalse
            node.der.accept(this); // der
            this.code.popObject(r.T0); // der
            this.code.beq(r.T0, r.ZERO, labelFalse); // if (!der) goto labelFalse

            this.code.li(r.T0, 1);
            this.code.push(r.T0);
            this.code.j(labelEnd);
            this.code.addLabel(labelFalse);
            this.code.li(r.T0, 0);
            this.code.push(r.T0);

            this.code.addLabel(labelEnd);
            this.code.pushObject({ type: 'bool', length: 4 });
            return
        }

        if (node.op === '||') {
            node.izq.accept(this); // izq
            this.code.popObject(r.T0); // izq

            const labelTrue = this.code.getLabel();
            const labelEnd = this.code.getLabel();

            this.code.bne(r.T0, r.ZERO, labelTrue); // if (izq) goto labelTrue
            node.der.accept(this); // der
            this.code.popObject(r.T0); // der
            this.code.bne(r.T0, r.ZERO, labelTrue); // if (der) goto labelTrue

            this.code.li(r.T0, 0);
            this.code.push(r.T0);

            this.code.j(labelEnd);
            this.code.addLabel(labelTrue);
            this.code.li(r.T0, 1);
            this.code.push(r.T0);

            this.code.addLabel(labelEnd);
            this.code.pushObject({ type: 'boolean', length: 4 });
            return
        }

        node.izq.accept(this); // izq |
        node.der.accept(this); // izq | der

        const isDerFloat = this.code.getTopObject().type === 'float';
        const der = this.code.popObject(isDerFloat ? f.FT0 : r.T0); // der
        const isIzqFloat = this.code.getTopObject().type === 'float';
        const izq = this.code.popObject(isIzqFloat ? f.FT1 : r.T1); // izq

        if (izq.type === 'string' && der.type === 'string') {
            this.code.add(r.A0, r.ZERO, r.T1);
            this.code.add(r.A1, r.ZERO, r.T0);
            this.code.callBuiltin('concatString');
            this.code.pushObject({ type: 'string', length: 4 });
            return;
        }

        if (isIzqFloat || isDerFloat) {
            if (!isIzqFloat) this.code.fcvtsw(f.FT1, r.T1);
            if (!isDerFloat) this.code.fcvtsw(f.FT0, r.T0);

            switch (node.op) {
                case '+':
                    this.code.fadd(f.FT0, f.FT1, f.FT0);
                    break;
                case '-':
                    this.code.fsub(f.FT0, f.FT1, f.FT0);
                    break;
                case '*':
                    this.code.fmul(f.FT0, f.FT1, f.FT0);
                    break;
                case '/':
                    this.code.fdiv(f.FT0, f.FT1, f.FT0);
                    break;
                case '%':
                    this.code.frem(f.FT0, f.FT1, f.FT0);
                    break;
                case '==':
                    this.code.feq(f.FT0, f.FT1, f.FT0);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'int', length: 4 });
                    return;
                case '!=':
                    this.code.feq(f.FT0, f.FT1, f.FT0);
                    this.code.xori(r.T0, r.T0, 1);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'int', length: 4 });
                    return;
                case '<':
                    this.code.flt(r.T0, f.FT1, f.FT0);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'int', length: 4 });
                    return;
                case '>':
                    this.code.flt(r.T0, f.FT0, f.FT1);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'int', length: 4 });
                    return;
                case '<=':
                    this.code.fle(r.T0, f.FT1, f.FT0);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'int', length: 4 });
                    return;
                case '>=':
                    this.code.fle(r.T0, f.FT0, f.FT1);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'int', length: 4 });
                    return;
                    
            }

            this.code.pushFloat(f.FT0);
            this.code.pushObject({ type: 'float', length: 4 });
            return;
            

        }
    
        switch (node.op) {
            case '+':
                this.code.add(r.T0, r.T1, r.T0); // Si son enteros, suma normal
                this.code.push(r.T0);
                break;
            case '-':
                this.code.sub(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                break;
            case '*':
                this.code.mul(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                break;
            case '/':
                this.code.div(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                break;
            case '%':
                this.code.rem(r.T0, r.T1, r.T0);
                this.code.push(r.T0);   
                break;
    
            // Comparaciones
            case '==':
                this.code.xor(r.T0, r.T0, r.T1); // Igual
                this.code.seqz(r.T0, r.T0); // Igual
                this.code.push(r.T0);
                break;
            case '!=':
                this.code.xor(r.T0, r.T0, r.T1); // Desigual
                this.code.snez(r.T0, r.T0); // Desigual
                this.code.push(r.T0);
                break;
            case '<':
                this.code.slt(r.T0, r.T1, r.T0); // Menor
                this.code.push(r.T0);
                break;
            case '>':
                this.code.slt(r.T0, r.T0, r.T1); // Mayor
                this.code.push(r.T0);
                break;
            case '<=':
                this.code.sge(r.T0, r.T1, r.T0); // Menor o igual
                this.code.push(r.T0);
                break;
            case '>=':
                this.code.sle(r.T0, r.T0, r.T1); // Mayor o igual
                this.code.push(r.T0);
                break;
        }
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
                this.code.push(r.T0);
                this.code.pushObject({ type: 'int', length: 4 });
                break;
            case '!':
                this.code.li(r.T1, 1);
                this.code.sub(r.T0, r.T1, r.T0);
                this.code.push(r.T0);
                this.code.pushObject({ type: 'int', length: 4 });
                break;
        }
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
            const isFloat = this.code.getTopObject().type === 'float';
            const object = this.code.popObject(isFloat ? f.FA0 : r.A0);
            const tipoPrint = {
                'int': () => this.code.printInt(),
                'string': () => this.code.printString(),
                'bool': () => this.code.printBool(),
                'char': () => this.code.printChar(),
                'float': () => this.code.printFloat(),
            }
            tipoPrint[object.type]();
        });
    }

     /**
     * @type {BaseVisitor['visitDeclaracionVariable']}
     */
     visitDeclaracionVariable(node) {
        this.code.comment(`Declaracion Variable: ${node.id}`);
        if (node.exp) {
        node.exp.accept(this);
        } else {
        this.code.pushConstant({ type: 'int', valor: 0 });
        }
        if (this.insideFunction) {
            const localObject = this.code.getFrameLocal(this.frameDclIndex);
            const valueObj = this.code.popObject(r.T0);

            this.code.addi(r.T1, r.FP, -localObject.offset * 4);
            this.code.sw(r.T0, r.T1);

            // ! inferir el tipo
            localObject.type = valueObj.type;
            this.frameDclIndex++;

            return
        }

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

        if (this.insideFunction) {
            this.code.addi(r.T1, r.FP, -variableObject.offset * 4); // ! REVISAR
            this.code.sw(r.T0, r.T1); // ! revisar
            return
        }

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
        this.code.comment('If');
        this.code.comment('Condición');
        node.cond.accept(this);
        this.code.popObject(r.T0);
        this.code.comment('Fin de condición');
        
        const hasElse = !!node.stmtFalse

        if (hasElse) {
            const elseLabel = this.code.getLabel();
            const endIfLabel = this.code.getLabel();

            this.code.beq(r.T0, r.ZERO, elseLabel);
            this.code.comment('Rama verdadera');
            node.stmtTrue.accept(this);
            this.code.j(endIfLabel);
            this.code.addLabel(elseLabel);
            this.code.comment('Rama falsa');
            node.stmtFalse.accept(this);
            this.code.addLabel(endIfLabel);
        } else {
            const endIfLabel = this.code.getLabel();
            this.code.beq(r.T0, r.ZERO, endIfLabel);
            this.code.comment('Rama verdadera');
            node.stmtTrue.accept(this);
            this.code.addLabel(endIfLabel);
        }

    
    }

    visitWhile(node) {
        this.code.comment('While loop');
        
        const startLabel = this.code.getLabel();
        const endLabel = this.code.getLabel();
        
        // Etiqueta del inicio del ciclo
        this.code.addLabel(startLabel);
        
        // Evaluar la condición
        this.code.comment('Condición del while');
        node.cond.accept(this);
        this.code.popObject(r.T0);  // Pop la condición al registro T0
        
        // Si la condición es falsa, salta al final del ciclo
        this.code.beqz(r.T0, endLabel);
        
        // Ejecutar el cuerpo del ciclo
        this.code.comment('Cuerpo del while');
        node.stmt.accept(this);
        
        // Salto de regreso al inicio del ciclo
        this.code.j(startLabel);
        
        // Etiqueta del final del ciclo
        this.code.addLabel(endLabel);
        this.code.comment('Fin del while');
    }

    //       return crearNodo('for', { init, cond, inc, stmt })
    visitFor(node) {
        const startLabel = this.code.getLabel();
        const endLabel = this.code.getLabel();
        const stepLabel = this.code.getLabel();

        node.init.accept(this); // inicialización
        this.code.addLabel(startLabel);
        node.cond.accept(this); // condición
        this.code.popObject(r.T0);
        this.code.beq(r.T0, r.ZERO, endLabel);

        node.stmt.accept(this); // cuerpo del ciclo
        this.code.addLabel(stepLabel);
        node.inc.accept(this); // incremento
        this.code.j(startLabel);
        this.code.addLabel(endLabel);
    }
    
    visitSwitch(node) {
        
        this.code.comment('Switch');
        node.expr.accept(this); // Evaluar expresión
        this.code.popObject(r.T2); // Almacenar resultado

        const endLabel = this.code.getLabel();
        const caseLabels = node.cases.map(() => this.code.getLabel());
        const defaultLabel = node.defaultCase ? this.code.getLabel() : endLabel;
        this.code.breakStack.push(endLabel);
        node.cases.forEach((c, i) => {
            this.code.comment(`Case ${c.value}`);
            c.expr.accept(this); // Evaluar la expresión del case
            this.code.popObject(r.T1);
            this.code.beq(r.T2, r.T1, caseLabels[i]); // Comparar con el valor de la expresión

        });
    
        if (node.defaultCase) {
            this.code.j(defaultLabel); // Saltar a default si ningún case coincide
        }
    
        node.cases.forEach((c, i) => {
            this.code.addLabel(caseLabels[i]);
            c.stmts.forEach(s => s.accept(this)); // Ejecutar los statements del case
            this.code.j(endLabel); // Saltar al final después de ejecutar un case
        });
    
        if (node.defaultCase) {
            this.code.addLabel(defaultLabel);
            node.defaultCase.stmts.forEach(s => s.accept(this)); // Ejecutar los statements del default 
        }
    
        this.code.addLabel(endLabel);

    }
    
    visitDeclaracionArray(node) {
        this.code.comment(`Declaración de Array: ${node.id}`);
        
        // Evaluar tamaño del array
        node.size.accept(this);
        const sizeObject = this.code.popObject(r.T0);
    
        this.code.allocateArray(sizeObject.valor, node.id); // Asignar espacio para el array
    
        this.code.pushObject({ type: 'array', size: sizeObject.valor, id: node.id });
        this.code.comment(`Fin de declaración de Array: ${node.id}`);
    }
    
    visitBreak(node) {
        
        this.code.comment('Break');
        const endLabel = this.code.getBreakLabel();
        this.code.j(endLabel);       
    }

    visitContinue(node) {
        this.code.comment('Continue');
        const startLabel = this.code.getContinueLabel();
        this.code.j(startLabel);
    }

    visitReturn(node) {
        this.code.comment('Return');
        if (node.exp) {
            node.exp.accept(this);
            this.code.popObject(r.V0);
        }
        this.code.j(this.code.getReturnLabel());
    }

    visitParseInt(node) {
        this.code.comment('parseIntString');
        node.exp.accept(this);
        
        const isFloat = this.code.getTopObject().type === 'float';
        this.code.popObject(isFloat ? f.FA0 : r.A0);
        
        if (isFloat) {
        this.code.callBuiltin('parseIntFloat');
        }else{
        this.code.callBuiltin('parseIntString');
        }
        this.code.pushObject({ type: 'int', length: 4 });
    }

    visitParseFloat(node) {
        this.code.comment('parseFloatString');
        node.exp.accept(this);
        this.code.popObject(r.A0);
        if (node.type === 'int') {
        this.code.callBuiltin('parseFloatInt');
        }else if (node.type === 'string') {
        this.code.callBuiltin('parseFloatString');
        }
        this.code.pushObject({ type: 'float', length: 4 });
    }

    
    visitTypeOf(node) {
      node.exp.accept(this);
      const valor = this.code.popObject(r.T0);
      if (valor.type === 'int') {
          this.code.pushConstant({ type: 'string', valor: 'int' });} else if (valor.type === 'float') {
          this.code.pushConstant({ type: 'string', valor: 'float' });} else if (valor.type === 'char') {
          this.code.pushConstant({ type: 'string', valor: 'char' });} else if (valor.type === 'boolean') {
          this.code.pushConstant({ type: 'string', valor: 'boolean' });} else if (valor.type === 'string') {
          this.code.pushConstant({ type: 'string', valor: 'string' });}
      this.code.pushObject({ type: 'string', length: 4 });
      return}

    visitToUpperCase(node) {
        this.code.comment('upperCaseBuiltin');
        node.exp.accept(this);
        this.code.popObject(r.A0);
        this.code.callBuiltin('upperCaseBuiltin');
        this.code.pushObject({ type: 'string', length: 4 });
    }

    visitToLowerCase(node) {
        this.code.comment('lowerCaseBuiltin');
        node.exp.accept(this);
        this.code.popObject(r.A0);
        this.code.callBuiltin('lowerCaseBuiltin');
        this.code.pushObject({ type: 'string', length: 4 });
    }

}