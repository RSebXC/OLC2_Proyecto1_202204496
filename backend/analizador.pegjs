
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
      'dato': nodos.Dato,
      'switch': nodos.Switch,
      'arrayLiteral': nodos.arrayLiteral,
      'declaracionArray': nodos.DeclaracionArray,
      'asignacionArray': nodos.AsignacionArray,
      'ternario': nodos.Ternario,
      'indexOf': nodos.IndexOf,
      'join': nodos.Join,
      'length': nodos.Length,
      'arrayAccess': nodos.ArrayAccess,
      'arrayAssignment': nodos.ArrayAssignment,
      'parseInt': nodos.ParseInt,
      'parseFloat': nodos.ParseFloat,
      'toString': nodos.ToString,
      'toLowerCase': nodos.ToLowerCase,
      'toUpperCase': nodos.ToUpperCase,
      'typeof': nodos.TypeOf,
      'dclFunc': nodos.FuncDcl,
      'dclClase': nodos.ClassDcl,
      'instancia': nodos.Instancia,
      'get': nodos.Get,
      'set': nodos.Set,
      'matrixDeclaracion': nodos.MatrixDeclaracion,
      'asignacionMatriz': nodos.AsignacionMatriz,
      'accesoMatriz': nodos.AccesoMatriz,
      'InstanciaStruct': nodos.InstanciaStruct
    }

    const nodo = new tipos[tipoNodo](props)
    nodo.location = location()
    return nodo
  }
}

programa = _ dcl:Declaracion* _ { return dcl }

Declaracion = dcl:Class _ { return dcl }
            / dcl:VarDcl _ { return dcl }
            / dcl:Funcion _ { return dcl }
            / stmt:Stmt _ { return stmt }

VarDcl =  tipo:Tipo _ id:Identificador _ "=" _ inst:InstanciaStruct _ ";" { return crearNodo('declaracionStruct', { id, tipo, inst }); }
       /tipo:Tipo _ id:Identificador _ "=" _ exp:Expresion _ ";" { return crearNodo('declaracionVariable', { id, exp, tipo }) }
       / tipo:Tipo _ id:Identificador _ (";" / ":")  { return crearNodo('declaracionVariable', { id, tipo }) }
       / tipo:Tipo _ "[" _ "]" _ id:Identificador _ "=" _ source:Identificador _ ";" {return crearNodo('asignacionArray', { id, source, tipo }); }
       / tipo:Tipo _ "[" _ "]" _ id:Identificador _ "=" _ array:ArrayLiteral _ ";" { return crearNodo('declaracionArray', { id, tipo, array }); }
       / tipo:Tipo _ "[" _ "]" _ id:Identificador _ "=" _ "new" _ tipoArray:Tipo _ "[" _ exp:Expresion _ "]" _ ";" { return crearNodo('declaracionArray', { id, tipo, tipoArray, tamano:exp }); }
       / MatrixDeclaration
       

MatrixDeclaration = tipo:(Tipo) _ "[""]" cor:("["_"]")+ _ id:Identificador _ "=" tipo2:( _"new" _ tipo2:Tipo {return tipo2})? _ valores:FormasMatrix _ ";"{
     
       if(tipo2 === tipo || (tipo === 'float' && tipo2 === 'int')){
          return crearNodo('matrixDeclaracion', { id, tipo, valores, size: valores });
        }else if(tipo2 === null ){
          return crearNodo('matrixDeclaracion', { id, tipo, valores, size: cor.length+1 }); 
        }else{
          throw new Error('Error de tipo en la declaracion de la matriz');
        }
     }

FormasMatrix = "[" _ size:Expresion _ "]" sizes:(_"[" _ sizeList:Expresion _ "]" {return sizeList})+  { console.log("sze", size); return [size, ...sizes];}
            / SimpleMatrix
            / values:Identificador { return values }

SimpleMatrix = "{"_ value:SimpleMatrix _ values:("," _ exp:SimpleMatrix { return exp })* _ "}" { return [value, ...values] }
            / values:Expresion { return values }

Funcion = Tipo _ id:Identificador _ "(" _ params:Parametros? _ ")" _ bloque:Bloque { return crearNodo('dclFunc', { id, params: params || [], bloque }) }

Class = "struct" _ id:Identificador _ "{" _ dcls:ClassBody+ _ "}" _ ";" { return crearNodo('dclClase', { id, dcls }) }

Parametros = tipo:Tipo _ id:Identificador _ params:("," _ tipos:Tipo _ ids:Identificador { return {tipo: tipos, id: ids} })* { return [{tipo, id}, ...params]; }

ClassBody
  = dcl:VarDcl _ { return dcl }
  / dcl:Funcion _ { return dcl }
  / dcl:InstanciaStruct _ { return dcl }

MatrixAssignment
= array:Identificador _ indices:("[" _ valores:Expresion _ "]" {return valores})+ _ "=" _ valor:Expresion _ ";" {
    return crearNodo('asignacionMatriz', { array, indices, valor });
  }

MatrixAccess
= array:Identificador _ indices:("[" _ valores:Expresion _ "]" {return valores})+ {
    return crearNodo('accesoMatriz', { array, indices });
  }


ArrayAccess = array:Identificador _ indices:("[" _ Expresion _ "]")+ { return crearNodo('accesoMatriz', { array, indices }); }

ArrayAssignment = array:Identificador _ indices:("[" _ Expresion _ "]")+ _ "=" _ valor:Expresion _ ";" { return crearNodo('asignacionMatriz', { array, indices, valor });    }

ArrayLiteral = "{" _ elems:(ArrayLiteral / ExpresionList)? _ "}" { return crearNodo('arrayLiteral', { elems: elems || [] });}

ExpresionList = first:Expresion _ rest:("," _ Expresion)* { return [first].concat(rest.map(item => item[2]));}

Stmt = "System.out.println(" _ exp:mensajes _ ")" _ ";" { return crearNodo('print', { exp }) }
    / Bloque:Bloque { return Bloque }
    / "{" _ dcls:Declaracion* _ "}" { return crearNodo('bloque', { dcls }) }
    / "if" _ "(" _ cond:Expresion _ ")" _ stmtTrue:Stmt 
      stmtFalse:(
        _ "else" _ stmtFalse:Stmt { return stmtFalse } 
      )? { return crearNodo('if', { cond, stmtTrue, stmtFalse }) }
    / "while" _ "(" _ cond:Expresion _ ")" _ stmt:Stmt { return crearNodo('while', { cond, stmt }) }
    / "for" _ "(" _ init:ForInit _ cond:Expresion _ ";"? _ inc:Expresion? _ ")" _ stmt:Stmt { return crearNodo('for', { init, cond, inc, stmt })}
    / "switch" _ "(" _ expr:Expresion _ ")" _ "{" _ cases:Case* defaultCase:Default? _ "}" { return crearNodo('switch', { expr, cases, defaultCase });}
    / "break" _ ";" { return crearNodo('break') }
    / "continue" _ ";" { return crearNodo('continue') }
    / "return" _ exp:Expresion? _ ";" { return crearNodo('return', { exp }) }
    /MatrixAssignment
    /MatrixAccess _ ";"
    / array:Identificador _ "[" _ index:Expresion _ "]" _ "=" _ valor:Expresion _ ";" { return crearNodo('arrayAssignment', { array, index, valor }); }
    / exp:Expresion _ ";" { return crearNodo('expresionStmt', { exp }) }

embebidas = "parseInt(" _ exp:Expresion _ ")" { return crearNodo('parseInt', { exp }) }
    / "parsefloat(" _ exp:Expresion _ ")" { return crearNodo('parseFloat', { exp }) }
    / "toString(" _ exp:Expresion _ ")" { return crearNodo('toString', { exp }) }
    / "toLowerCase(" _ exp:Expresion _ ")" { return crearNodo('toLowerCase', { exp }) }
    / "toUpperCase(" _ exp:Expresion _ ")" { return crearNodo('toUpperCase', { exp }) }
    / "typeof " _ exp:Expresion { return crearNodo('typeof', { exp }) }

mensajes = exp1:(MatrixAccess / Expresion) _ args:("," _ exp2:(MatrixAccess / Expresion) { return exp2 })* { return [exp1, ...args] }

Case = "case" _ expr:Expresion _ ":" _ stmts:Declaracion* {return { expr, stmts };}

Default = "default" _ ":" _ stmts:Declaracion* {return { stmts };}

ForInit = dcl:VarDcl { return dcl }
        / exp:Expresion _ ";" { return exp }
        / ";" { return null }

Identificador = [a-zA-Z][a-zA-Z0-9]* { return text() }

Expresion =  embebidas
            / kkk:Asignacion {return kkk }

Corchetes = "[" _ indice:Expresion _ "]" { return indice; }      
    
Bloque = "{" _ dcls:Declaracion* _ "}" { return crearNodo('bloque', { dcls }) }

Asignacion =
    id:Identificador _ op:("=" / "+=" / "-=") _ asgn:Expresion {
      console.log('asignacion', id, op, asgn)

        return crearNodo('asignacion', { id, op, asgn });
    }
    / array:Identificador _ "[" _ index:Expresion _ "]" _ "=" _ valor:Expresion _ ";" { return crearNodo('arrayAssignment', { array, index, valor }); }
    / id:Identificador _ indices:Corchetes+ _ "=" _ valor:Expresion _ ";" {return crearNodo('asignacionMatriz', { id, indices, valor });}
    / ttt:Ternario {return ttt}

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

Or = izq:AND expansion:(
  _ op:("||") _ der:AND { return { tipo: op, der } }
)* {
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual;
      return crearNodo('binaria', { op: tipo, izq: operacionAnterior, der });
    },
    izq
  );
}

AND = izq:Comparacion expansion:(
  _ op:("&&") _ der:Comparacion { return { tipo: op, der } }
)* {
  return expansion.reduce(
    (operacionAnterior, operacionActual) => {
      const { tipo, der } = operacionActual;
      return crearNodo('binaria', { op: tipo, izq: operacionAnterior, der });
    },
    izq
  );
}

Ternario = cond:Or _ "?" _ expTrue:Ternario _ ":" _ expFalse:Ternario {
  return crearNodo('ternario', { cond, expTrue, expFalse });
}
/ orr:Or {return orr} 

Unaria = op:("-"/"!") _ num:Unaria { return crearNodo('unaria', { op, exp: num }) }
/ Llamada

Llamada = objetivoInicial:Dato operaciones:(
    ("(" _ args:Argumentos? _ ")" { return {args, tipo: 'funcCall' } })
    / ("." _ id:Identificador _ { return { id, tipo: 'get' } })
  )* 
  {
  const op =  operaciones.reduce(
    (objetivo, args) => {
      // return crearNodo('llamada', { callee, args: args || [] })
      const { tipo, id, args:argumentos } = args

      if (tipo === 'funcCall') {
        return crearNodo('llamada', { callee: objetivo, args: argumentos || [] })
      }else if (tipo === 'get') {
        return crearNodo('get', { objetivo, propiedad: id })
      }
    },
    objetivoInicial
  )

  console.log('llamada', {op}, {text: text()});

return op
}

// a()()
// NODO-> callee: a, params: [] --- CALLEE1
// NODO-> callee: NODO-> callee: CALLEE1, params: []

Argumentos = arg:Expresion _ args:("," _ exp:Expresion { return exp })* { return [arg, ...args] }


// { return{ tipo: "numero", valor: parseFloat(text(), 10) } }
Dato =
"(" _ exp:Expresion _ ")" { return crearNodo('agrupacion', { exp }) }
  / "[" _ exp:Expresion _ "]" { return crearNodo('agrupacion', { exp }) }
  /  Float
  / Int
  / String
  / Char
  / Bool
  / null
  / "new" _ id:Identificador _ "(" _ args:Argumentos? _ ")" { return crearNodo('instancia', { id, args: args || [] }) }
  /array:Identificador _ "." _ "indexOf" _ "(" _ elem:Expresion _ ")" { 
        return crearNodo('indexOf', { array, elem }); 
    }
    / array:Identificador _ "." _ "join" _ "(" _ ")" { 
        return crearNodo('join', { array }); 
    }
    / array:Identificador _ "." _ "length" { 
        return crearNodo('length', { array }); 
    }
    / array:Identificador _ "[" _ index:Expresion _ "]" { 
        return crearNodo('arrayAccess', { array, index }); 
    }
  / id:Identificador { return crearNodo('referenciaVariable', { id }) }

InstanciaStruct
    = id:Identificador _ "{" _ valores:PropStruct _ "}" {
        return crearNodo('InstanciaStruct', { id, valores });
    }

PropStruct
    = props:(PropStructItem (_ "," _ PropStructItem)*)? {
        return props ? props.flat() : [];
    }

PropStructItem
    = id:Identificador _ ":" _ valor:Expresion {
        return { id, valor };
    }

Float = [0-9]+( "." [0-9]+ ) { return crearNodo('dato', { tipo: 'float', valor: parseFloat(text(), 10) }) }

Int = [0-9]+ { return crearNodo('dato', { tipo: 'int', valor: parseInt(text(), 10) }) }

String = "\"" chars:[^"]* "\"" { return crearNodo('dato', { tipo: 'string', valor: chars.join('') }) }

Char = "'" char:[^'] "'" { return crearNodo('dato', { tipo: 'char', valor: char[0] }) }

Bool = "true" { return crearNodo('dato', { tipo: 'bool', valor: true }) }
     / "false" { return crearNodo('dato', { tipo: 'bool', valor: false }) }

null = "null" { return crearNodo('dato', { tipo: 'null', valor: null }) }

_ = ([ \t\n\r] / Comentarios)* 


Comentarios = "//" (![\n] .)*
            / "/*" (!("*/") .)* "*/"

Tipo = "int" / "float" / "string" / "char" / "bool" / "var" / "void" / "struct"