
{
  const crearNodo = (tipoNodo, props) =>{
    const tipos = {
      'numero': nodos.Numero,
      'agrupacion': nodos.Agrupacion,
      'binaria': nodos.OperacionBinaria,
      'unaria': nodos.OperacionUnaria,
      'declaracionVariable': nodos.DeclaracionVariable,
      'referenciaVariable': nodos.ReferenciaVariable,
      'print': nodos.Print,
      'expresionStmt': nodos.ExpresionStmt,
      'asignacion': nodos.Asignacion,
      'bloque': nodos.Bloque,
      'if': nodos.If,
      'while': nodos.While,
      'for': nodos.For,
      'break': nodos.Break,
      'continue': nodos.Continue,
      'return': nodos.Return,
      'llamada': nodos.Llamada,
      'tipo': nodos.Tipo,
      'dato': nodos.Dato
    }

    const nodo = new tipos[tipoNodo](props)
    nodo.location = location()
    return nodo
  }
}

programa = _ dcl:Declaracion* _ { return dcl }

Declaracion = dcl:VarDcl _ { return dcl }
            / stmt:Stmt _ { return stmt }

VarDcl = Tipo _ id:Identificador _ "=" _ exp:Expresion _ ";" { return crearNodo('declaracionVariable', { id, exp }) }

Stmt = "System.out.println(" _ exp:Expresion _ ")" _ ";" { return crearNodo('print', { exp }) }
    / "{" _ dcls:Declaracion* _ "}" { return crearNodo('bloque', { dcls }) }
    / "if" _ "(" _ cond:Expresion _ ")" _ stmtTrue:Stmt 
      stmtFalse:(
        _ "else" _ stmtFalse:Stmt { return stmtFalse } 
      )? { return crearNodo('if', { cond, stmtTrue, stmtFalse }) }
    / "while" _ "(" _ cond:Expresion _ ")" _ stmt:Stmt { return crearNodo('while', { cond, stmt }) }
    / "for" _ "(" _ init:ForInit _ cond:Expresion _ ";" _ inc:Expresion _ ")" _ stmt:Stmt {
      return crearNodo('for', { init, cond, inc, stmt })
    }
    / "break" _ ";" { return crearNodo('break') }
    / "continue" _ ";" { return crearNodo('continue') }
    / "return" _ exp:Expresion? _ ";" { return crearNodo('return', { exp }) }
    / exp:Expresion _ ";" { return crearNodo('expresionStmt', { exp }) }

ForInit = dcl:VarDcl { return dcl }
        / exp:Expresion _ ";" { return exp }
        / ";" { return null }

Identificador = [a-zA-Z][a-zA-Z0-9]* { return text() }

Expresion = Asignacion / Ternario

Asignacion = id:Identificador _ "=" _ asgn:Asignacion { return crearNodo('asignacion', { id, asgn }) }
          / Comparacion

Comparacion = izq:Relacional expansion:(
  _ op:("==" / "!=") _ der:Relacional { return { tipo: op, der } }
)* {
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual;
      return crearNodo('binaria', { op: tipo, izq: operacionAnterior, der });
    },
    izq
  );
}


Suma = izq:Multiplicacion expansion:(
  _ op:("+" / "-") _ der:Multiplicacion { return { tipo: op, der } }
)* { 
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual
      return crearNodo('binaria', { op:tipo, izq: operacionAnterior, der })
    },
    izq
  )
}

Multiplicacion = izq:Unaria expansion:(
  _ op:("*" / "/" / "%") _ der:Unaria { return { tipo: op, der } }
)* {
    return expansion.reduce(
      (operacionAnterior, operacionActual) => {
        const { tipo, der } = operacionActual
        return crearNodo('binaria', { op:tipo, izq: operacionAnterior, der })
      },
      izq
    )
}



Relacional = izq:Suma expansion:(
  _ op:("<=" / ">=" / "<" / ">") _ der:Suma { return { tipo: op, der } }
)* {
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual;
      return crearNodo('binaria', { op: tipo, izq: operacionAnterior, der });
    },
    izq
  );
}

Logico = izq:Comparacion expansion:(
  _ op:("&&" / "||") _ der:Comparacion { return { tipo: op, der } }
)* {
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual;
      return crearNodo('binaria', { op: tipo, izq: operacionAnterior, der });
    },
    izq
  );
}

Ternario = cond:Logico _ "?" _ expTrue:Expresion _ ":" _ expFalse:Expresion {
  return crearNodo('ternario', { cond, expTrue, expFalse });
}

Unaria = "-" _ num:Unaria { return crearNodo('unaria', { op: '-', exp: num }) }
/ Llamada

Llamada = callee:Dato _ params:("(" args:Argumentos? ")" { return args })* {
  return params.reduce(
    (callee, args) => {
      return crearNodo('llamada', { callee, args: args || [] })
    },
    callee
  )
}

// a()()
// NODO-> callee: a, params: [] --- CALLEE1
// NODO-> callee: NODO-> callee: CALLEE1, params: []

Argumentos = arg:Expresion _ args:("," _ exp:Expresion { return exp })* { return [arg, ...args] }


// { return{ tipo: "numero", valor: parseFloat(text(), 10) } }
Dato =
    Float
  / Int
  / String
  / Char
  / Bool
  / "(" _ exp:Expresion _ ")" { return crearNodo('agrupacion', { exp }) }
  / id:Identificador { return crearNodo('referenciaVariable', { id }) }
  

Float = [0-9]+( "." [0-9]+ ) { return crearNodo('dato', { tipo: 'float', valor: parseFloat(text(), 10) }) }

Int = [0-9]+ { return crearNodo('dato', { tipo: 'int', valor: parseInt(text(), 10) }) }

String = "\"" chars:[^"]* "\"" { return crearNodo('dato', { tipo: 'string', valor: chars.join('') }) }

Char = "'" char:[^'] "'" { return crearNodo('dato', { tipo: 'char', valor: char[0] }) }

Bool = "true" { return crearNodo('dato', { tipo: 'bool', valor: true }) }
     / "false" { return crearNodo('dato', { tipo: 'bool', valor: false }) }

_ = ([ \t\n\r] / Comentarios)* 


Comentarios = "//" (![\n] .)*
            / "/*" (!("*/") .)* "*/"

Tipo = "int" / "float" / "string" / "char" / "bool" / "var"