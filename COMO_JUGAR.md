# 🎮 CÓMO JUGAR - Ruleta TypeScript Online

## 🚀 Inicio Rápido

El servidor ya está corriendo en: **http://localhost:3000**

### 📱 Para Jugar desde tu Móvil

1. Conecta tu móvil a la misma red WiFi que tu PC
2. En el PC, ejecuta en PowerShell: `ipconfig`
3. Busca tu IPv4 (ejemplo: 192.168.1.100)
4. En el móvil, abre el navegador y ve a: `http://[TU-IP]:3000`

## 🎯 Cómo Jugar

### Opción 1: Un solo dispositivo (todos juntos)
1. Abre http://localhost:3000
2. Crea una sala nueva
3. Comparte el código con los demás desde el mismo dispositivo

### Opción 2: Multijugador Online (cada uno con su dispositivo) ⭐RECOMENDADO⭐

#### Para el Anfitrión:
1. Abre http://localhost:3000 en tu navegador
2. Haz clic en **"Crear Sala Nueva"**
3. Ingresa tu nombre
4. **Comparte el código de 6 caracteres con tus amigos**
   - Ejemplo: ABC123
5. Espera a que se unan (mínimo 2 jugadores)
6. Haz clic en **"Comenzar Juego"**

#### Para los demás Jugadores:
1. Abre http://localhost:3000 en TU navegador/móvil
2. Haz clic en **"Unirse a Sala"**
3. Ingresa TU nombre
4. Ingresa el código que te compartió el anfitrión
5. Espera en el lobby
6. **¡Juega desde tu propio dispositivo!**

## 🎮 Durante el Juego

- ⏰ Solo el jugador del turno puede girar la ruleta
- 🎯 Solo el jugador del turno puede responder
- 👀 Los demás pueden ver la pregunta en sus pantallas
- 📊 Todos ven los puntajes actualizados en tiempo real
- 🔄 El turno pasa automáticamente al siguiente jugador

## 💡 Consejos

- ✅ Usa nombres cortos (máximo 20 caracteres)
- ✅ Comparte el código de sala por WhatsApp, Discord, etc.
- ✅ El anfitrión controla cuándo empieza el juego
- ✅ Puedes copiar el código con el botón 📋
- ✅ Máximo 10 jugadores por sala

## 🛑 Detener el Servidor

Para detener el servidor, presiona `Ctrl + C` en la terminal donde está corriendo.

## ❓ Problemas Comunes

### No puedo conectarme desde el móvil
- ✅ Asegúrate de estar en la misma red WiFi
- ✅ Usa la IP correcta (no 127.0.0.1 ni localhost desde móvil)
- ✅ Verifica que el firewall no bloquee el puerto 3000

### La sala no funciona
- ✅ El servidor debe estar corriendo
- ✅ Verifica que hayas compilado con `npm run build`
- ✅ Refresca la página del navegador

## 📝 Ejemplo de Uso

```
PC del Anfitrión:
1. Abre http://localhost:3000
2. Crea sala → Código: XYZ789
3. Comparte XYZ789 con amigos

Móvil del Amigo 1:
1. Abre http://192.168.1.100:3000 (IP del PC anfitrión)
2. Unirse a sala → Código: XYZ789
3. ¡Listo!

Otro PC del Amigo 2:
1. Abre http://192.168.1.100:3000
2. Unirse a sala → Código: XYZ789
3. ¡Listo!

Todos esperan en el lobby → Anfitrión inicia → ¡A jugar!
```

---

🎉 **¡Disfruta del juego!** 🎉
