export class Entorno {
    /**
     * @param {Entorno} padre
     */
    constructor(padre = undefined) {
        this.valores = {};  // {nombre: {tipo, valor}}
        this.padre = padre;
        this.simbolos = {};

        this.variables = {};
        this.variables["Object"] = {
            keys: (obj) => Object.keys(obj),
        };        
    }

    /**
     * Verifica si una variable existe en el entorno actual.
     * @param {string} nombre
     * @returns {boolean}
     */
    existeEnEntornoActual(nombre) {
        return this.valores.hasOwnProperty(nombre);
    }

    /**
     * Define una nueva variable en el entorno actual.
     * @param {string} nombre
     * @param {{tipo: string, valor: any}} valor
     */
     setVariable(nombre, { tipo, valor }, linea = 0, columna = 0) {
        if (this.existeEnEntornoActual(nombre)) {
            throw new Error(`Variable ${nombre} ya está definida en este entorno`);
        }
        this.valores[nombre] = { tipo, valor };

        // Agregamos el símbolo a la tabla de símbolos
        this.agregarSimbolo(nombre, tipo, valor, linea, columna);
    }

    /**
     * Obtiene una variable del entorno actual o de algún entorno padre.
     * @param {string} nombre
     * @returns {{tipo: string, valor: any}}
     */
    getVariable(nombre) {
        // Primero busca en las variables globales
        if (this.variables.hasOwnProperty(nombre)) {
            return this.variables[nombre];
        }
    
        // Luego busca en las variables locales
        const variable = this.valores[nombre];
        if (variable !== undefined) {
            return variable;
        }
    
        // Si no está en el entorno actual, busca en el padre
        if (this.padre) {
            return this.padre.getVariable(nombre);
        }
    
        throw new Error(`Variable ${nombre} no definida`);
    }
    

    /**
     * Asigna un valor a una variable existente en el entorno actual o en un entorno padre.
     * @param {string} nombre
     * @param {any} valor
     */
    assignVariable(nombre, valor) {
        const variable = this.valores[nombre];
        console.log(`Definiendo variable ${nombre} en entorno actual con valor ${valor} ...`);
        if (variable !== undefined) {
            this.valores[nombre] = valor;
            return;
        }

        if (!variable && this.padre) {
            this.padre.assignVariable(nombre, valor);
            return;
        }

        throw new Error(`Variable ${nombre} no definida`);
    }

    agregarSimbolo(nombre, tipo, valor, linea, columna) {
        this.simbolos[nombre] = { tipo, valor, linea, columna };
    }

    // Este método devolverá la tabla de símbolos del entorno actual
    getSimbolos() {
        return this.simbolos;
    }

}

