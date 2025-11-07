# 🎯 INSTRUCCIONES FINALES - Social_Z

## ✅ Lo que ya está hecho:

1. ✅ **Dependencias instaladas** (npm install completado)
2. ✅ **Backend corriendo** en puerto 4000
3. ✅ **Metro Bundler corriendo** en puerto 8081
4. ✅ **Todos los archivos actualizados**

## 🚀 QUÉ HACER AHORA:

### En tu emulador/dispositivo Android:

1. **Asegúrate de que:**
   - El emulador está corriendo
   - O tienes un dispositivo físico conectado

2. **En la terminal donde está Metro Bundler (deberías ver el logo de React Native):**
   - Presiona `a` para correr en Android
   - O presiona `d` para abrir DevTools

3. **La app debería abrir en el emulador**

## 📱 Cómo usar la app:

### Primera vez:
1. Completa el registro (username, email, password)
2. Inicia sesión

### Para probar subida de imágenes:
1. Ve a **"Crear Tweet"** (debería estar en el tab de inicio)
2. Escribe algo en el campo de texto
3. Presiona **"📷 Galería"** para elegir una foto OR **"📸 Cámara"** para tomar una
4. Verás una vista previa de la imagen
5. Presiona **"Publicar Tweet"**
6. Deberías ver tu tweet con la imagen en el feed

## 🔍 Si algo falla:

### "Runtime not ready" error:
```powershell
# En la terminal de Metro (donde ves el logo de React Native):
# Presiona: Ctrl+C para detener
# Luego:
npm start -- --reset-cache
```

### Emulador no detecta la app:
```powershell
# Asegúrate que el Metro está corriendo, luego:
npx react-native run-android
```

### Backend no responde:
```powershell
# Verifica que está corriendo en otra terminal:
cd c:\Users\user\Desktop\Social_Z\server
npm run dev
```

## 📋 Checklist de Test:

- [ ] App abre sin errores
- [ ] Puedo ver la pantalla de login
- [ ] Puedo registrar un usuario nuevo
- [ ] Puedo iniciar sesión
- [ ] Puedo ver la pantalla de crear tweet
- [ ] Puedo escribir un tweet
- [ ] Puedo agregar una imagen de la galería
- [ ] Puedo ver la vista previa de la imagen
- [ ] Puedo publicar el tweet
- [ ] El tweet aparece en el feed con la imagen
- [ ] La imagen se ve correctamente

## 🛠️ Problemas Comunes

### "Cannot find module 'react-native-image-picker'"
**Solución:**
```powershell
cd c:\Users\user\Desktop\Social_Z
npm install react-native-image-picker@^8.2.1
npm start -- --reset-cache
```

### "Address already in use :::8081"
**Solución:**
```powershell
# Mata todos los procesos node
taskkill /F /IM node.exe
npm start
```

### Emulador dice "Cannot connect to the development server"
**Solución:**
En archivo `src/api/api.js`, verifica que usas:
- `10.0.2.2:4000` en emulador Android (para localhost)
- Tu IP real si usas dispositivo físico

## 📞 Logs Para Debugging

**Abre la consola de Metro presionando `d` y busca:**

1. **Error al subir:** 
   - Busca `❌ Error en crearTweet`
   - Muestra qué falló exactamente

2. **Backend recibió datos:**
   - Backend mostrará: `createTweet - body: { userId, text, image }`

3. **Imagen guardada:**
   - Backend mostrará: `Imagen guardada en: /uploads/timestamp-random.jpg`

## 📊 Estructura de Carpetas Lista

```
Social_Z/
├── src/
│   ├── screens/Main/
│   │   └── CreateTweetScreen.js  ✅ (Actualizado para react-native-image-picker)
│   ├── api/
│   │   └── api.js  ✅ (Manejo de imágenes)
│   └── ...
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── tweetController.js  ✅ (Validación mejorada)
│   │   ├── routes/
│   │   │   └── tweetsRoutes.js  ✅ (multer configurado)
│   │   └── ...
│   └── uploads/  ✅ (Donde se guardan las imágenes)
├── package.json  ✅ (Sin expo-image-picker)
├── app.json  ✅ (Configuración React Native)
└── node_modules/  ✅ (894 packages)
```

## 💡 Tips

1. **Para test rápido sin interfaz:**
   - Abre Postman o insomnia
   - POST a `http://localhost:4000/api/tweets`
   - Body (form-data): `userId`, `text`, `image`

2. **Para ver las imágenes guardadas:**
   - Ve a: `c:\Users\user\Desktop\Social_Z\server\uploads\`
   - Deberías ver los archivos con nombres como: `1699-xxx.jpg`

3. **Para ver logs del servidor:**
   - Mira la terminal donde corre `npm run dev` en `server/`

---

**¿Listo? ¡Ahora intenta presionar `a` en el Metro Bundler para correr en Android! 🎉**
