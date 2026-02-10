# 🎡 Ruleta TypeScript - La Fortuna del Código

![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?style=for-the-badge&logo=typescript)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

## 🎮 Descripción

**Ruleta TypeScript** es un juego interactivo **MULTIJUGADOR ONLINE en tiempo real** de preguntas y respuestas sobre TypeScript. Cada jugador puede unirse desde su propio móvil u ordenador usando un código de sala. Diseñado con animaciones espectaculares y una experiencia de usuario premium.

### ✨ Características Principales

- 🌐 **Multijugador Online Real-Time**: Cada jugador en su dispositivo
- 🎡 **Ruleta Animada**: Ruleta interactiva con 8 segmentos de diferentes puntuaciones
- 👥 **2-10 Jugadores**: Sistema de salas con código único
- 📱 **100% Responsive**: Diseñado para móviles, tablets y desktop
- ❓ **50+ Preguntas**: Banco extenso de preguntas sobre TypeScript con 3 niveles de dificultad
- 🎨 **Diseño Épico**: Interfaz moderna con gradientes, animaciones y efectos visuales impresionantes
- ⏱️ **Timer de Preguntas**: 30 segundos para responder cada pregunta
- 🏆 **Sistema de Puntuación**: Podio con los 3 mejores jugadores y tabla de clasificación en tiempo real
- 🎊 **Efectos Especiales**: Confetti, partículas animadas y notificaciones interactivas
- 🔒 **Sistema de Anfitrión**: Control del juego por el creador de la sala

## 🎯 Mecánica del Juego

1. **Crear/Unirse a Sala**: Un jugador crea una sala y comparte el código con otros
2. **Espera en Lobby**: Los jugadores se unen usando el código de 6 caracteres
3. **Girar la Ruleta**: Cada jugador gira la ruleta en su turno desde su dispositivo
4. **Responder Preguntas**: La ruleta determina los puntos en juego (50-500 pts)
5. **Ganar Puntos**: Solo el jugador del turno puede responder en 30 segundos
6. **Victoria**: El jugador con más puntos al final de 10 rondas gana

## 🛠️ Tecnologías Utilizadas

- **TypeScript**: Lógica del juego con tipado fuerte
- **Node.js + Express**: Servidor backend
- **Socket.IO**: Comunicación en tiempo real
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

# Iniciar el servidor
npm start
```

### Ejecutar el Juego

El servidor se iniciará en `http://localhost:3000`

```bash
# Iniciar servidor
npm start

# El servidor mostrará:
# 🌐 Servidor corriendo en: http://localhost:3000
# 📱 Acceso desde móviles: http://[TU_IP_LOCAL]:3000
```

### Jugar desde dispositivos móviles

1. Conecta tu móvil a la misma red WiFi que el servidor
2. Encuentra la IP local de tu ordenador:
   - **Windows**: `ipconfig` (busca IPv4)
   - **Mac/Linux**: `ifconfig` o `ip addr`
3. Abre el navegador del móvil y ve a `http://[TU-IP]:3000`
4. ¡Listo para jugar!

### Modo Desarrollo

Para compilar automáticamente al editar archivos TypeScript:

```bash
# En una terminal
npm run dev

# En otra terminal
npm run server
```

## 📚 Estructura del Proyecto

```
Juego_TypeScript/
├── server/
│   └── index.js         # Servidor Socket.IO
├── src/
│   ├── game-online.ts   # Cliente multijugador online
│   ├── game.ts          # Cliente local (legacy)
│   ├── types.ts         # Interfaces y tipos TypeScript
│   ├── questions.ts     # Banco de 50+ preguntas
│   └── utils.ts         # Utilidades y helpers
├── dist/                # JavaScript compilado
├── index.html           # Archivo principal HTML
├── styles.css           # Estilos y animaciones responsive
├── tsconfig.json        # Configuración TypeScript
├── package.json         # Dependencias del proyecto
└── README.md           # Este archivo
```

## 🎮 Cómo Jugar Online

### Para el Anfitrión:

1. Abre el juego en tu navegador
2. Haz clic en "Crear Sala Nueva"
3. Ingresa tu nombre
4. Comparte el código de 6 caracteres con tus amigos
5. Espera a que se unan (mínimo 2 jugadores)
6. Haz clic en "Comenzar Juego"

### Para los Jugadores:

1. Abre el juego en tu navegador (móvil o PC)
2. Haz clic en "Unirse a Sala"
3. Ingresa tu nombre y el código de sala
4. Espera en el lobby a que comience el juego
5. ¡Juega desde tu dispositivo!

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

### Cambiar Puerto del Servidor

Edita `server/index.js` o usa variable de entorno:

```bash
PORT=8080 npm start
```

### Modificar Número de Rondas

En `server/index.js`, cambia `totalRounds: 10` al valor deseado.

## 📱 Responsive Design

El juego está optimizado para:

- 📱 **Móviles** (320px+): Interfaz simplificada y táctil
- 📱 **Tablets** (768px+): Layout adaptado
- 💻 **Desktop** (1024px+): Experiencia completa con sidebar

## 🚀 Características Técnicas

- **WebSockets**: Comunicación bidireccional en tiempo real
- **Sistema de Salas**: Múltiples partidas simultáneas
- **Sincronización**: Estado del juego compartido entre todos los clientes
- **Reconexión**: Manejo de desconexiones temporales
- **Validación**: Solo jugadores autorizados pueden ejecutar acciones
- **Responsive**: Mobile-first design con breakpoints optimizados

## 📈 Próximas Mejoras

- [ ] Chat en tiempo real entre jugadores
- [ ] Sonidos y música de fondo
- [ ] Modo espectador
- [ ] Historial de partidas
- [ ] Rankings globales
- [ ] Más categorías de preguntas
- [ ] Sistema de avatares personalizados
- [ ] Achievements y badges
- [ ] Exportar resultados como imagen

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si quieres mejorar el juego:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 🐛 Solución de Problemas

### No puedo conectarme desde el móvil

- Verifica que ambos dispositivos estén en la misma red WiFi
- Asegúrate de que el firewall no bloquee el puerto 3000
- Usa la IP local correcta (no 127.0.0.1 o localhost)

### El juego se desconecta

- Verifica tu conexión a internet
- El servidor debe estar corriendo continuamente
- Revisa la consola del servidor para errores

### Las preguntas no aparecen

- Asegúrate de haber compilado el proyecto: `npm run build`
- Verifica que `dist/questions.js` exista

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## 👨‍💻 Autor

**Juanca-309**

## 🌟 Agradecimientos

- Fuentes: Google Fonts (Orbitron, Poppins)
- Socket.IO por la comunicación en tiempo real
- Inspiración: Juegos de ruleta clásicos y quiz shows

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!

🎮 ¡Diviértete aprendiendo TypeScript con tus amigos online!