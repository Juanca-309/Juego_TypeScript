import { Question } from './types.js';

// ============================
// BANCO DE PREGUNTAS TYPESCRIPT
// ============================

export const questions: Question[] = [
    // ===== PREGUNTAS EASY =====
    {
        id: 1,
        question: '¿Qué es TypeScript?',
        answers: [
            'Un superset de JavaScript con tipos estáticos',
            'Un lenguaje de programación completamente diferente',
            'Una librería de JavaScript',
            'Un framework para backend'
        ],
        correctIndex: 0,
        category: 'Fundamentos',
        difficulty: 'easy',
        explanation: 'TypeScript es un superset de JavaScript que añade tipado estático opcional'
    },
    {
        id: 2,
        question: '¿Qué comando compila archivos TypeScript a JavaScript?',
        answers: ['tsc', 'compile', 'typescript', 'tscompile'],
        correctIndex: 0,
        category: 'Herramientas',
        difficulty: 'easy'
    },
    {
        id: 3,
        question: '¿Cuál es la extensión de archivo de TypeScript?',
        answers: ['.ts', '.tsx', '.js', '.typescript'],
        correctIndex: 0,
        category: 'Fundamentos',
        difficulty: 'easy'
    },
    {
        id: 4,
        question: '¿Qué tipo de dato se usa para valores verdadero/falso?',
        answers: ['boolean', 'bool', 'bit', 'logical'],
        correctIndex: 0,
        category: 'Tipos',
        difficulty: 'easy'
    },
    {
        id: 5,
        question: '¿Cuál NO es un tipo primitivo en TypeScript?',
        answers: ['array', 'string', 'number', 'boolean'],
        correctIndex: 0,
        category: 'Tipos',
        difficulty: 'easy'
    },
    {
        id: 6,
        question: '¿Qué palabra clave se usa para declarar una interfaz?',
        answers: ['interface', 'type', 'class', 'struct'],
        correctIndex: 0,
        category: 'Interfaces',
        difficulty: 'easy'
    },
    {
        id: 7,
        question: '¿Qué significa el símbolo "?" en una propiedad?',
        answers: [
            'Indica que la propiedad es opcional',
            'Indica que es un operador ternario',
            'Indica que es nullable',
            'Es un error de sintaxis'
        ],
        correctIndex: 0,
        category: 'Tipos',
        difficulty: 'easy'
    },
    {
        id: 8,
        question: '¿Qué archivo configura las opciones del compilador TypeScript?',
        answers: ['tsconfig.json', 'package.json', 'config.ts', 'typescript.config'],
        correctIndex: 0,
        category: 'Configuración',
        difficulty: 'easy'
    },
    {
        id: 9,
        question: '¿Cuál es el tipo para cualquier valor en TypeScript?',
        answers: ['any', 'all', 'unknown', 'object'],
        correctIndex: 0,
        category: 'Tipos',
        difficulty: 'easy'
    },
    {
        id: 10,
        question: '¿Qué palabra clave define una clase?',
        answers: ['class', 'function', 'object', 'struct'],
        correctIndex: 0,
        category: 'POO',
        difficulty: 'easy'
    },

    // ===== PREGUNTAS MEDIUM =====
    {
        id: 11,
        question: '¿Cuál es la diferencia entre "interface" y "type"?',
        answers: [
            'Interface puede extenderse, type es más flexible con uniones',
            'Son exactamente lo mismo',
            'Type solo para primitivos, interface para objetos',
            'Interface es obsoleto'
        ],
        correctIndex: 0,
        category: 'Tipos Avanzados',
        difficulty: 'medium'
    },
    {
        id: 12,
        question: '¿Qué es un "Tuple" en TypeScript?',
        answers: [
            'Un array con longitud y tipos fijos',
            'Un objeto inmutable',
            'Una función genérica',
            'Un tipo de clase especial'
        ],
        correctIndex: 0,
        category: 'Tipos',
        difficulty: 'medium'
    },
    {
        id: 13,
        question: '¿Qué hace el modificador "readonly"?',
        answers: [
            'Hace que una propiedad sea de solo lectura',
            'Hace que una variable sea constante',
            'Protege una función de ser llamada',
            'Es un decorador especial'
        ],
        correctIndex: 0,
        category: 'Modificadores',
        difficulty: 'medium'
    },
    {
        id: 14,
        question: '¿Qué representa el tipo "never"?',
        answers: [
            'Valores que nunca ocurren',
            'Valores nulos',
            'Valores indefinidos',
            'Funciones que no retornan'
        ],
        correctIndex: 0,
        category: 'Tipos',
        difficulty: 'medium'
    },
    {
        id: 15,
        question: '¿Qué son los Generics?',
        answers: [
            'Tipos parametrizables que hacen el código reutilizable',
            'Funciones especiales de JavaScript',
            'Clases abstractas',
            'Interfaces con métodos opcionales'
        ],
        correctIndex: 0,
        category: 'Generics',
        difficulty: 'medium'
    },
    {
        id: 16,
        question: '¿Cuál es el propósito de "enum"?',
        answers: [
            'Definir un conjunto de constantes nombradas',
            'Crear arrays tipados',
            'Definir funciones genéricas',
            'Crear objetos inmutables'
        ],
        correctIndex: 0,
        category: 'Enums',
        difficulty: 'medium'
    },
    {
        id: 17,
        question: '¿Qué es "Type Assertion"?',
        answers: [
            'Decirle al compilador que conocemos mejor el tipo',
            'Una forma de crear tipos nuevos',
            'Un método para validar tipos en runtime',
            'Una función de conversión de tipos'
        ],
        correctIndex: 0,
        category: 'Tipos Avanzados',
        difficulty: 'medium'
    },
    {
        id: 18,
        question: '¿Qué hace "strictNullChecks"?',
        answers: [
            'Hace que null y undefined sean tipos separados',
            'Previene el uso de null',
            'Convierte null a undefined',
            'Desactiva la verificación de tipos'
        ],
        correctIndex: 0,
        category: 'Configuración',
        difficulty: 'medium'
    },
    {
        id: 19,
        question: '¿Qué es un "Union Type"?',
        answers: [
            'Un tipo que puede ser uno de varios tipos',
            'La unión de dos interfaces',
            'Un array de diferentes tipos',
            'Una clase con herencia múltiple'
        ],
        correctIndex: 0,
        category: 'Tipos',
        difficulty: 'medium'
    },
    {
        id: 20,
        question: '¿Qué palabra clave se usa para heredar de una clase?',
        answers: ['extends', 'inherits', 'implements', 'from'],
        correctIndex: 0,
        category: 'POO',
        difficulty: 'medium'
    },

    // ===== PREGUNTAS HARD =====
    {
        id: 21,
        question: '¿Qué es "Mapped Types"?',
        answers: [
            'Tipos que transforman propiedades de otros tipos',
            'Tipos para trabajar con Maps',
            'Funciones que mapean arrays',
            'Interfaces con métodos map'
        ],
        correctIndex: 0,
        category: 'Tipos Avanzados',
        difficulty: 'hard'
    },
    {
        id: 22,
        question: '¿Qué hace el tipo utility "Partial<T>"?',
        answers: [
            'Hace todas las propiedades opcionales',
            'Hace todas las propiedades requeridas',
            'Selecciona parte de las propiedades',
            'Elimina propiedades'
        ],
        correctIndex: 0,
        category: 'Utility Types',
        difficulty: 'hard'
    },
    {
        id: 23,
        question: '¿Qué es "Conditional Types"?',
        answers: [
            'Tipos que dependen de una condición',
            'Tipos para if/else statements',
            'Validaciones de tipos en runtime',
            'Tipos opcionales'
        ],
        correctIndex: 0,
        category: 'Tipos Avanzados',
        difficulty: 'hard'
    },
    {
        id: 24,
        question: '¿Qué hace "keyof" operator?',
        answers: [
            'Obtiene las claves de un tipo como union type',
            'Obtiene los valores de un objeto',
            'Crea un objeto con claves',
            'Valida que una clave existe'
        ],
        correctIndex: 0,
        category: 'Operadores',
        difficulty: 'hard'
    },
    {
        id: 25,
        question: '¿Qué es "Covariance" y "Contravariance"?',
        answers: [
            'Reglas sobre cómo los tipos se relacionan en jerarquías',
            'Tipos de variables en TypeScript',
            'Métodos para convertir tipos',
            'Modificadores de acceso'
        ],
        correctIndex: 0,
        category: 'Conceptos Avanzados',
        difficulty: 'hard'
    },
    {
        id: 26,
        question: '¿Qué hace "infer" en Conditional Types?',
        answers: [
            'Infiere y captura un tipo dentro de una condición',
            'Infiere el tipo de una variable',
            'Valida tipos automáticamente',
            'Convierte tipos implícitamente'
        ],
        correctIndex: 0,
        category: 'Tipos Avanzados',
        difficulty: 'hard'
    },
    {
        id: 27,
        question: '¿Qué es "Template Literal Types"?',
        answers: [
            'Tipos que usan template strings para crear nuevos tipos',
            'Strings con tipos especiales',
            'Tipos para templates HTML',
            'Literales de objetos'
        ],
        correctIndex: 0,
        category: 'Tipos Avanzados',
        difficulty: 'hard'
    },
    {
        id: 28,
        question: '¿Qué hace "abstract" en una clase?',
        answers: [
            'Marca la clase como no instanciable directamente',
            'Oculta métodos privados',
            'Hace la clase inmutable',
            'Convierte la clase en interface'
        ],
        correctIndex: 0,
        category: 'POO',
        difficulty: 'hard'
    },
    {
        id: 29,
        question: '¿Qué es "Discriminated Unions"?',
        answers: [
            'Union types con propiedad común para discriminar',
            'Uniones de tipos primitivos',
            'Separación de tipos por categorías',
            'Arrays con tipos mixtos'
        ],
        correctIndex: 0,
        category: 'Patterns',
        difficulty: 'hard'
    },
    {
        id: 30,
        question: '¿Qué hace el utility type "Record<K, T>"?',
        answers: [
            'Crea un objeto con claves K y valores T',
            'Graba el historial de tipos',
            'Registra tipos en runtime',
            'Crea un array de tuplas'
        ],
        correctIndex: 0,
        category: 'Utility Types',
        difficulty: 'hard'
    },

    // ===== MÁS PREGUNTAS VARIADAS =====
    {
        id: 31,
        question: '¿Qué tipo tiene una función que no retorna nada?',
        answers: ['void', 'null', 'undefined', 'never'],
        correctIndex: 0,
        category: 'Tipos',
        difficulty: 'easy'
    },
    {
        id: 32,
        question: '¿Cuál es el modificador de acceso por defecto en clases?',
        answers: ['public', 'private', 'protected', 'internal'],
        correctIndex: 0,
        category: 'POO',
        difficulty: 'medium'
    },
    {
        id: 33,
        question: '¿Qué hace el operador "as" ?',
        answers: [
            'Realiza type assertion',
            'Compara tipos',
            'Convierte tipos en runtime',
            'Asigna valores'
        ],
        correctIndex: 0,
        category: 'Operadores',
        difficulty: 'medium'
    },
    {
        id: 34,
        question: '¿Qué es "namespace" en TypeScript?',
        answers: [
            'Una forma de organizar código en grupos lógicos',
            'Lo mismo que un módulo ES6',
            'Una función especial',
            'Un tipo de clase'
        ],
        correctIndex: 0,
        category: 'Organización',
        difficulty: 'medium'
    },
    {
        id: 35,
        question: '¿Qué hace "Omit<T, K>" utility type?',
        answers: [
            'Omite propiedades K del tipo T',
            'Selecciona solo propiedades K',
            'Hace propiedades opcionales',
            'Elimina un tipo completamente'
        ],
        correctIndex: 0,
        category: 'Utility Types',
        difficulty: 'hard'
    },
    {
        id: 36,
        question: '¿Qué es el "Non-null assertion operator"?',
        answers: [
            'El operador ! que indica que un valor no es null',
            'Un operador para eliminar null',
            'Una función para validar null',
            'Un tipo especial'
        ],
        correctIndex: 0,
        category: 'Operadores',
        difficulty: 'medium'
    },
    {
        id: 37,
        question: '¿Qué hace "Pick<T, K>" utility type?',
        answers: [
            'Selecciona solo las propiedades K del tipo T',
            'Elimina propiedades K',
            'Combina tipos T y K',
            'Crea un array de propiedades'
        ],
        correctIndex: 0,
        category: 'Utility Types',
        difficulty: 'hard'
    },
    {
        id: 38,
        question: '¿Qué es "Type Guard"?',
        answers: [
            'Una expresión que realiza verificación de tipos en runtime',
            'Un modificador de acceso',
            'Una función genérica',
            'Un decorador'
        ],
        correctIndex: 0,
        category: 'Patterns',
        difficulty: 'medium'
    },
    {
        id: 39,
        question: '¿Cuál es la diferencia entre "unknown" y "any"?',
        answers: [
            'unknown requiere verificación de tipo antes de usar',
            'Son exactamente iguales',
            'unknown es más permisivo',
            'any es más seguro'
        ],
        correctIndex: 0,
        category: 'Tipos',
        difficulty: 'medium'
    },
    {
        id: 40,
        question: '¿Qué hace "implements" en una clase?',
        answers: [
            'Indica que la clase implementa una interfaz',
            'Hereda de otra clase',
            'Crea una instancia',
            'Define métodos abstractos'
        ],
        correctIndex: 0,
        category: 'POO',
        difficulty: 'medium'
    },
    {
        id: 41,
        question: '¿Qué son los Decorators?',
        answers: [
            'Funciones que modifican clases, métodos o propiedades',
            'Patrones de diseño',
            'Tipos especiales',
            'Funciones de orden superior'
        ],
        correctIndex: 0,
        category: 'Decorators',
        difficulty: 'hard'
    },
    {
        id: 42,
        question: '¿Qué hace "ReturnType<T>" utility type?',
        answers: [
            'Obtiene el tipo de retorno de una función',
            'Define el tipo de retorno',
            'Valida el retorno en runtime',
            'Convierte tipos de retorno'
        ],
        correctIndex: 0,
        category: 'Utility Types',
        difficulty: 'hard'
    },
    {
        id: 43,
        question: '¿Qué es "Index Signature"?',
        answers: [
            'Define tipos para propiedades dinámicas de objetos',
            'Índices de arrays',
            'Firmas de funciones',
            'Nombres de propiedades'
        ],
        correctIndex: 0,
        category: 'Tipos',
        difficulty: 'medium'
    },
    {
        id: 44,
        question: '¿Qué hace "Exclude<T, U>" utility type?',
        answers: [
            'Excluye de T los tipos que están en U',
            'Incluye solo tipos de U',
            'Combina T y U',
            'Valida exclusividad'
        ],
        correctIndex: 0,
        category: 'Utility Types',
        difficulty: 'hard'
    },
    {
        id: 45,
        question: '¿Qué es "Intersection Types"?',
        answers: [
            'Combinación de múltiples tipos en uno',
            'Tipos que se cruzan',
            'Verificación de tipos comunes',
            'Unión de interfaces'
        ],
        correctIndex: 0,
        category: 'Tipos',
        difficulty: 'medium'
    },
    {
        id: 46,
        question: '¿Qué hace el flag "--strict" en tsconfig?',
        answers: [
            'Activa todas las verificaciones estrictas',
            'Solo activa strictNullChecks',
            'Hace el código más rápido',
            'Elimina warnings'
        ],
        correctIndex: 0,
        category: 'Configuración',
        difficulty: 'medium'
    },
    {
        id: 47,
        question: '¿Qué es "Variadic Tuple Types"?',
        answers: [
            'Tuplas con longitud variable usando rest elements',
            'Arrays de tipos variados',
            'Funciones con parámetros variables',
            'Tipos dinámicos'
        ],
        correctIndex: 0,
        category: 'Tipos Avanzados',
        difficulty: 'hard'
    },
    {
        id: 48,
        question: '¿Qué hace "Readonly<T>" utility type?',
        answers: [
            'Hace todas las propiedades de T readonly',
            'Crea constantes',
            'Congela objetos',
            'Previene mutaciones en runtime'
        ],
        correctIndex: 0,
        category: 'Utility Types',
        difficulty: 'medium'
    },
    {
        id: 49,
        question: '¿Qué es "Ambient Declarations"?',
        answers: [
            'Declaraciones que definen tipos para código externo',
            'Variables globales',
            'Tipos del entorno',
            'Configuraciones del compilador'
        ],
        correctIndex: 0,
        category: 'Declaraciones',
        difficulty: 'hard'
    },
    {
        id: 50,
        question: '¿Qué archivo se usa para declarar tipos de librerías JS?',
        answers: ['.d.ts', '.types.ts', '.declare.ts', '.typedef.ts'],
        correctIndex: 0,
        category: 'Declaraciones',
        difficulty: 'medium'
    }
];

export function getRandomQuestion(usedIds: Set<number>): Question | null {
    const availableQuestions = questions.filter(q => !usedIds.has(q.id));
    
    if (availableQuestions.length === 0) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
}

export function getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Question[] {
    return questions.filter(q => q.difficulty === difficulty);
}
