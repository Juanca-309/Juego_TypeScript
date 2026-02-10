# 🎡 Ruleta TypeScript - La Fortuna del Código

![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?style=for-the-badge&logo=typescript)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

## 🎮 Descripción

**Ruleta TypeScript** es un juego interactivo épico de preguntas y respuestas sobre TypeScript, diseñado con animaciones espectaculares y una experiencia de usuario premium. Perfecto para aprender TypeScript mientras te diviertes con amigos o compañeros de trabajo.

### ✨ Características Principales

- 🎡 **Ruleta Animada**: Ruleta interactiva con 8 segmentos de diferentes puntuaciones
- 👥 **Multijugador**: Soporta de 2 a 10 jugadores simultáneos
- ❓ **50+ Preguntas**: Banco extenso de preguntas sobre TypeScript con 3 niveles de dificultad
- 🎨 **Diseño Épico**: Interfaz moderna con gradientes, animaciones y efectos visuales impresionantes
- ⏱️ **Timer de Preguntas**: 30 segundos para responder cada pregunta
- 🏆 **Sistema de Puntuación**: Podio con los 3 mejores jugadores y tabla de clasificación
- 🎊 **Efectos Especiales**: Confetti, partículas animadas y notificaciones interactivas
- 📱 **Responsive**: Diseño adaptable a diferentes tamaños de pantalla
- 🚀 **Sin Backend**: 100% Frontend - funciona directamente desde el navegador

## 🎯 Mecánica del Juego

1. **Añadir Jugadores**: Entre 2 y 10 jugadores pueden unirse al juego
2. **Girar la Ruleta**: Cada jugador gira la ruleta en su turno
3. **Responder Preguntas**: La ruleta determina los puntos en juego (50-500 pts)
4. **Ganar Puntos**: Responde correctamente en 30 segundos para ganar puntos
5. **Victoria**: El jugador con más puntos al final de 10 rondas gana

## 🛠️ Tecnologías Utilizadas

- **TypeScript**: Lógica del juego con tipado fuerte
- **HTML5**: Estructura semántica
- **CSS3**: Animaciones, gradientes y efectos visuales avanzados
- **SVG**: Gráficos vectoriales para la ruleta
- **Canvas API**: Animación de confetti

## 📦 Instalación y Uso

### Prerrequisitos

- Node.js (v14 o superior)
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Juanca-309/Juego_TypeScript.git

# Entrar al directorio
cd Juego_TypeScript

# Instalar dependencias
npm install

# Compilar TypeScript
npm run build
```

### Ejecutar el Juego

Simplemente abre el archivo `index.html` en tu navegador favorito:

```bash
# Opción 1: Abrir directamente
start index.html  # Windows
open index.html   # macOS
xdg-open index.html  # Linux

# Opción 2: Usar un servidor local (recomendado)
npx serve .
# O usar Live Server en VS Code
```

### Modo Desarrollo

Para compilar automáticamente cuando edites archivos TypeScript:

```bash
npm run dev
```

## 📚 Estructura del Proyecto

```
Juego_TypeScript/
├── src/
│   ├── game.ts          # Lógica principal del juego
│   ├── types.ts         # Interfaces y tipos TypeScript
│   ├── questions.ts     # Banco de 50+ preguntas
│   └── utils.ts         # Utilidades y helpers
├── dist/                # JavaScript compilado
├── index.html           # Archivo principal HTML
├── styles.css           # Estilos y animaciones
├── tsconfig.json        # Configuración TypeScript
├── package.json         # Dependencias del proyecto
└── README.md           # Este archivo
```

## 🎨 Capturas de Pantalla

### Pantalla de Inicio
Interfaz elegante para añadir jugadores con efectos de partículas animadas.

### Pantalla de Juego
Ruleta interactiva girando con animaciones fluidas y panel de pregunta modal.

### Pantalla de Resultados
Podio animado con los 3 mejores jugadores y efectos de confetti.

## 🎓 Categorías de Preguntas

- **Fundamentos**: Conceptos básicos de TypeScript
- **Tipos**: Tipos primitivos, avanzados y utility types
- **POO**: Clases, interfaces y herencia
- **Generics**: Tipos genéricos y parametrizables
- **Configuración**: tsconfig.json y opciones del compilador
- **Tipos Avanzados**: Mapped types, conditional types, template literals
- **Utility Types**: Partial, Pick, Omit, Record, etc.
- **Patterns**: Type guards, discriminated unions
- **Conceptos Avanzados**: Covariance, contravariance, ambient declarations

## 🔧 Personalización

### Añadir Más Preguntas

Edita `src/questions.ts` y añade nuevas preguntas siguiendo el formato:

```typescript
{
    id: 51,
    question: '¿Tu pregunta aquí?',
    answers: ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'],
    correctIndex: 0,
    category: 'Categoría',
    difficulty: 'easy',
    explanation: 'Explicación opcional'
}
```

### Modificar Segmentos de la Ruleta

En `src/game.ts`, método `createWheelSegments()`, puedes modificar los puntos y colores:

```typescript
{ points: 100, color: '#3b82f6', label: '100' }
```

### Cambiar Número de Rondas

En `src/game.ts`, modifica la propiedad `totalRounds` en el constructor.

## 🚀 Características Avanzadas

- **Animaciones CSS**: Transiciones suaves y keyframe animations
- **Efectos de Confetti**: Canvas animation con partículas físicas
- **Sistema de Notificaciones**: Toast notifications con auto-dismiss
- **Timer Visual**: Barra de progreso animada con degradado de colores
- **Scoreboard en Tiempo Real**: Actualización dinámica de puntuaciones
- **Responsive Design**: Adapta a móviles, tablets y desktop
- **Partículas de Fondo**: Animación continua de partículas flotantes

## 📈 Próximas Mejoras

- [ ] Sonidos y música de fondo
- [ ] Modo oscuro/claro
- [ ] Guardar puntuaciones en localStorage
- [ ] Compartir resultados en redes sociales
- [ ] Más categorías de preguntas
- [ ] Modo de dificultad seleccionable
- [ ] Achievements y badges
- [ ] Multiplayer online

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si quieres mejorar el juego:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## 👨‍💻 Autor

**Juanca-309**

## 🌟 Agradecimientos

- Fuentes: Google Fonts (Orbitron, Poppins)
- Inspiración: Juegos de ruleta clásicos y quiz shows

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!

🎮 ¡Diviértete aprendiendo TypeScript!