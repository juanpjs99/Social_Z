# 📱 Documentación: Common Header Component - Social_Z

## 📋 Índice
1. [Resumen de la Segunda Parte](#resumen-de-la-segunda-parte)
2. [¿Qué es un Header Común?](#qué-es-un-header-común)
3. [Implementación del Header](#implementación-del-header)
4. [Funcionalidad de Logout](#funcionalidad-de-logout)
5. [Integración en Pantallas](#integración-en-pantallas)
6. [Problemas Resueltos](#problemas-resueltos)
7. [Explicación Técnica Simple](#explicación-técnica-simple)

---

## 🎯 Resumen de la Segunda Parte

### ¿Qué agregamos?
Después de completar el feature de perfil de usuario, agregamos un **Header común** que aparece en todas las pantallas principales de la app.

### Objetivo
- Tener un encabezado consistente en toda la aplicación
- Facilitar la navegación (regresar al Home)
- Permitir cerrar sesión desde cualquier pantalla
- Mostrar información del usuario logueado

### Tiempo de Desarrollo
Aproximadamente 1-2 horas de trabajo

---

## 🤔 ¿Qué es un Header Común?

### Concepto
Un **Header común** es un componente reutilizable que aparece en la parte superior de múltiples pantallas con el mismo diseño y funcionalidad.

**Piénsalo así:**
- Como el menú superior de Instagram (siempre está arriba)
- Como la barra de navegación de YouTube
- Como el header de Twitter/X que nunca cambia

### ¿Por qué es importante?
✅ **Consistencia**: Todas las pantallas se ven igual  
✅ **Reutilización**: Escribes el código una vez, lo usas en todos lados  
✅ **Mantenimiento**: Si cambias algo, se actualiza en todas las pantallas  
✅ **UX**: El usuario sabe dónde están las cosas siempre

---

## 💻 Implementación del Header

### Estructura del Componente
**Archivo**: `src/components/Header.js`

```javascript
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Header({ title, showBackButton = false }) {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);

  // ... funciones
  
  return (
    <View style={styles.header}>
      {/* Izquierda: Logo o botón de regresar */}
      {/* Centro: Título o username */}
      {/* Derecha: Botón de logout */}
    </View>
  );
}
```

### Partes del Header

#### 1. **Lado Izquierdo - Logo/Navegación**
```javascript
<View style={styles.leftSection}>
  {showBackButton ? (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={24} color="#1DA1F2" />
    </TouchableOpacity>
  ) : (
    <TouchableOpacity onPress={handleLogoPress} style={styles.logoContainer}>
      <Image 
        source={require('../assets/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
    </TouchableOpacity>
  )}
</View>
```

**¿Qué hace?**
- Si `showBackButton` es `true` → Muestra flecha para regresar
- Si `showBackButton` es `false` → Muestra el logo de Social Z
- Al presionar el logo → Te lleva al Home/Inicio

**Analogía**: Es como el botón de "Home" en tu navegador web

#### 2. **Centro - Título o Username**
```javascript
<View style={styles.centerSection}>
  {title ? (
    <Text style={styles.title}>{title}</Text>
  ) : (
    <Text style={styles.username}>@{user?.username}</Text>
  )}
</View>
```

**¿Qué hace?**
- Si le pasas un `title` → Muestra ese título (ej: "Home", "Profile")
- Si NO le pasas título → Muestra el username del usuario logueado

**Ejemplo de uso**:
```javascript
<Header title="Home" />        // Muestra "Home"
<Header />                     // Muestra "@tu_usuario"
```

#### 3. **Lado Derecho - Logout**
```javascript
<View style={styles.rightSection}>
  <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
    <Ionicons name="log-out-outline" size={24} color="#E0245E" />
  </TouchableOpacity>
</View>
```

**¿Qué hace?**
- Muestra un ícono de "salir" en rojo
- Al presionarlo → Abre confirmación de cerrar sesión

---

## 🚪 Funcionalidad de Logout

### Problema Original
Cuando el usuario presionaba logout, el estado cambiaba pero la app no regresaba al login inmediatamente.

### Solución Implementada

#### 1. **Confirmación con Alert**
```javascript
const handleLogout = () => {
  Alert.alert(
    "Cerrar Sesión",
    "¿Estás seguro que quieres cerrar sesión?",
    [
      {
        text: "Cancelar",
        style: "cancel"
      },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            })
          );
        }
      }
    ]
  );
};
```

**¿Qué hace paso a paso?**

1. **Muestra diálogo de confirmación**
   - Título: "Cerrar Sesión"
   - Mensaje: "¿Estás seguro...?"
   - Dos botones: Cancelar y Cerrar Sesión

2. **Si presiona "Cancelar"**
   - No pasa nada, se cierra el diálogo

3. **Si presiona "Cerrar Sesión"**
   - Ejecuta `logout()` → Limpia datos del usuario
   - Ejecuta `navigation.dispatch(CommonActions.reset(...))` → Resetea navegación

#### 2. **Limpieza de Datos (AuthContext)**
**Archivo**: `src/context/AuthContext.js`

```javascript
const logout = async () => {
  try {
    setUser(null);                              // Quita el usuario del estado
    await AsyncStorage.removeItem('user');      // Borra del storage
    await AsyncStorage.removeItem('token');     // Borra el token
    await AsyncStorage.clear();                 // Limpia todo por si acaso
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};
```

**¿Por qué limpiamos TODO?**
- `setUser(null)` → React sabe que no hay usuario
- `removeItem('user')` → Borra info del usuario guardada
- `removeItem('token')` → Borra token de autenticación
- `clear()` → Limpia cualquier otra cosa que haya quedado

#### 3. **Reset de Navegación**
```javascript
navigation.dispatch(
  CommonActions.reset({
    index: 0,
    routes: [{ name: 'Login' }],
  })
);
```

**¿Qué significa esto?**
- `CommonActions.reset()` → Borra todo el historial de navegación
- `index: 0` → Empieza desde la primera pantalla
- `routes: [{ name: 'Login' }]` → La única pantalla es Login

**Resultado**: 
- Te lleva al Login
- NO puedes volver con el botón "atrás" (porque no hay historial)
- Es como si acabaras de abrir la app

**Analogía**: Es como apagar y prender tu celular - empiezas desde cero

---

## 🔗 Integración en Pantallas

### Antes (Sin Header Común)
Cada pantalla tenía su propio header diferente:

```javascript
// HomeScreen.js - ANTES
<View style={styles.header}>
  <Text style={styles.title}>Inicio</Text>
  <TouchableOpacity>
    <Ionicons name="create-outline" size={26} color="#1DA1F2" />
  </TouchableOpacity>
</View>
```

**Problemas:**
- ❌ Cada pantalla se veía diferente
- ❌ Código duplicado
- ❌ Difícil de mantener

### Después (Con Header Común)
Todas usan el mismo componente:

```javascript
// HomeScreen.js - DESPUÉS
import Header from "../../components/Header";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Header title="Home" />
      {/* Resto del contenido */}
    </View>
  );
}
```

**Ventajas:**
- ✅ Todas las pantallas se ven igual
- ✅ Una sola línea de código
- ✅ Fácil de actualizar

### Pantallas Actualizadas

#### 1. **HomeScreen** - Pantalla Principal
```javascript
<Header title="Home" />
```
- Muestra "Home" en el centro
- Logo a la izquierda
- Logout a la derecha

#### 2. **ProfileScreen** - Perfil de Usuario
```javascript
<Header title="Profile" />
```
- Muestra "Profile" en el centro
- Logo a la izquierda
- Logout a la derecha

#### 3. **FollowersScreen** - Lista de Seguidores
```javascript
<Header title="Followers" />
```
- Muestra "Followers" en el centro

#### 4. **FollowingScreen** - Lista de Seguidos
```javascript
<Header title="Following" />
```
- Muestra "Following" en el centro

### Configuración de Navegación
**Archivo**: `src/navigation/MainTabs.js`

```javascript
<Tab.Navigator
  screenOptions={({ route }) => ({
    headerShown: false, // ⬅️ IMPORTANTE: Ocultar headers por defecto
    tabBarActiveTintColor: "#1DA1F2",
    // ... otros estilos
  })}
>
```

**¿Por qué `headerShown: false`?**
- React Navigation muestra headers automáticamente
- Nosotros queremos usar nuestro Header personalizado
- `headerShown: false` oculta los headers automáticos
- Así solo se ve NUESTRO Header

---

## 🐛 Problemas Resueltos

### Problema 1: Logo lleva a pantalla incorrecta
**Error**: Al presionar logo → Error "Home is not defined"

**Causa**: La ruta del Home se llamaba "Inicio", no "Home"

**Solución**:
```javascript
// ANTES (❌ Error)
const handleLogoPress = () => {
  navigation.navigate('Home');
};

// DESPUÉS (✅ Correcto)
const handleLogoPress = () => {
  navigation.navigate('Inicio');
};
```

**Aprendizaje**: Los nombres de rutas deben coincidir EXACTAMENTE con los definidos en el navegador

### Problema 2: Logout no cierra sesión inmediatamente
**Síntoma**: Presionas "Cerrar Sesión" pero te quedas en la misma pantalla

**Causa**: El estado cambiaba pero React Navigation no actualizaba

**Solución**: Usar `CommonActions.reset()` para forzar la navegación

**Antes**:
```javascript
onPress: () => logout() // Solo cambia estado
```

**Después**:
```javascript
onPress: async () => {
  await logout();
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    })
  );
}
```

### Problema 3: Headers duplicados (uno arriba de otro)
**Síntoma**: Aparecían DOS headers - uno nuestro y uno de React Navigation

**Causa**: React Navigation muestra headers por defecto

**Solución**: Agregar `headerShown: false` en la configuración

```javascript
screenOptions={{
  headerShown: false, // Oculta headers automáticos
}}
```

---

## 📚 Explicación Técnica Simple

### ¿Qué son los Props?
**Props** = Propiedades que le pasas a un componente

```javascript
<Header title="Home" />
         ↑
      Este es un prop
```

Es como darle instrucciones al componente:
- "Oye Header, muestra el título 'Home'"

### ¿Qué es useContext?
**useContext** = Acceso a datos globales de la app

```javascript
const { user, logout } = useContext(AuthContext);
```

**Analogía**: Es como una mochila que llevas a todos lados
- Puedes sacar datos (user) desde cualquier pantalla
- Puedes usar funciones (logout) desde cualquier lugar

**Sin Context**:
```
LoginScreen → guarda usuario → pasa a HomeScreen → pasa a ProfileScreen
(complicado, muchos pasos)
```

**Con Context**:
```
LoginScreen → guarda en Context
HomeScreen → lee de Context
ProfileScreen → lee de Context
(simple, todos leen del mismo lugar)
```

### ¿Qué es AsyncStorage?
**AsyncStorage** = Memoria permanente del celular

**Analogía**: Es como guardar en un archivo en tu PC
- `setItem()` = Guardar archivo
- `getItem()` = Abrir archivo
- `removeItem()` = Borrar archivo
- `clear()` = Borrar todos los archivos

**¿Por qué lo usamos?**
- Para que cuando cierres la app y la vuelvas a abrir, sigas logueado
- Es como las cookies en un navegador web

### ¿Qué es CommonActions.reset()?
**CommonActions.reset()** = Reiniciar la navegación desde cero

**Analogía**: 
- Imagina que tienes un libro abierto en la página 50
- `reset()` es cerrar el libro y abrirlo en la página 1
- Ya no puedes volver a la página 50 con el botón atrás

**¿Cuándo usarlo?**
- Logout → Llevar a login sin poder volver
- Terminar tutorial → Llevar a app principal
- Completar compra → Llevar a confirmación

### ¿Qué es navigation.dispatch()?
**dispatch()** = Ejecutar una acción de navegación de forma programática

```javascript
// Navegación normal
navigation.navigate('Login') // Solo cambia de pantalla

// Navegación con dispatch
navigation.dispatch(
  CommonActions.reset({...})  // Ejecuta acción compleja
)
```

**Diferencia**:
- `navigate()` = "Ve a esta pantalla"
- `dispatch(reset())` = "Borra todo y empieza de nuevo"

---

## 🎯 Conceptos Clave Aprendidos

### 1. Componentes Reutilizables
**¿Qué es?** Un componente que usas en muchos lugares

**Beneficios:**
- ✅ Escribes código una vez
- ✅ Cambias en un lugar, se actualiza en todos lados
- ✅ Menos errores
- ✅ Código más limpio

**Ejemplo Real**: Los botones de Facebook
- El mismo botón "Like" en posts, fotos, videos
- Si Facebook cambia el botón, lo cambia en todos lados a la vez

### 2. Separación de Responsabilidades
**Concepto**: Cada archivo hace UNA cosa

- `Header.js` → Solo el encabezado
- `HomeScreen.js` → Solo el contenido del home
- `AuthContext.js` → Solo manejo de autenticación

**¿Por qué?**
- Fácil de encontrar bugs
- Fácil de hacer cambios
- Fácil de trabajar en equipo

### 3. Manejo de Estado Global
**Estado Global** = Datos que toda la app necesita

**Ejemplos:**
- Usuario logueado ✅
- Idioma de la app ✅
- Tema (claro/oscuro) ✅
- Carrito de compras ✅

**NO debe ser global:**
- Valor de un input en un formulario ❌
- Ítem seleccionado en una lista ❌
- Estado de loading de una pantalla específica ❌

### 4. UX (User Experience)
**Decisiones que tomamos pensando en el usuario:**

✅ **Confirmación antes de logout**
- Previene cierres accidentales
- El usuario se siente seguro

✅ **Logo lleva al Home**
- Patrón conocido (todas las apps lo hacen)
- Navegación intuitiva

✅ **Username visible en header**
- El usuario siempre sabe en qué cuenta está
- Útil si tiene múltiples cuentas

✅ **Reset de navegación en logout**
- No puede volver a las pantallas privadas
- Seguridad y privacidad

---

## 📊 Estructura Final del Proyecto

```
src/
├── components/
│   ├── Header.js          ← ✨ NUEVO: Header común
│   ├── TweetCard.js
│   └── TweetButton.js
├── context/
│   └── AuthContext.js     ← 🔄 MODIFICADO: Agregado updateUser
├── navigation/
│   ├── MainTabs.js        ← 🔄 MODIFICADO: headerShown: false
│   └── ...
├── screens/
│   ├── Main/
│   │   ├── HomeScreen.js       ← 🔄 MODIFICADO: Usa Header
│   │   ├── ProfileScreen.js    ← 🔄 MODIFICADO: Usa Header
│   │   ├── FollowersScreen.js  ← 🔄 MODIFICADO: Usa Header
│   │   └── FollowingScreen.js  ← 🔄 MODIFICADO: Usa Header
│   └── ...
└── assets/
    └── logo.png           ← ✨ NUEVO: Logo de Social Z
```

---

## 🔄 Flujo Completo de Logout

```
1. Usuario presiona ícono de logout
   ↓
2. Se muestra Alert con confirmación
   ↓
3. Usuario presiona "Cerrar Sesión"
   ↓
4. Se ejecuta logout():
   - setUser(null)
   - AsyncStorage.removeItem('user')
   - AsyncStorage.removeItem('token')
   - AsyncStorage.clear()
   ↓
5. Se ejecuta navigation.dispatch(CommonActions.reset())
   ↓
6. Navegación resetea a pantalla Login
   ↓
7. Usuario ve pantalla de Login
   ✅ No puede volver con botón atrás
```

---

## 💡 Para Explicar a la Profesora

### ¿Qué problema resuelve este feature?

En una aplicación móvil profesional, es fundamental tener:

1. **Consistencia Visual**: Todas las pantallas deben verse similares
2. **Navegación Intuitiva**: El usuario debe saber cómo volver al inicio
3. **Gestión de Sesión**: Poder cerrar sesión de forma segura desde cualquier lugar

### Decisiones de Diseño

1. **Componente Reutilizable**
   - Seguí el principio DRY (Don't Repeat Yourself)
   - Un solo componente usado en 4+ pantallas
   - Fácil mantenimiento y actualización

2. **Props Flexibles**
   - `title`: Permite customizar el título por pantalla
   - `showBackButton`: Permite mostrar flecha o logo según contexto
   - Hace el componente adaptable sin código duplicado

3. **Confirmación de Logout**
   - UX best practice de aplicaciones móviles
   - Previene pérdida accidental de sesión
   - Similar a Instagram, Twitter, Facebook

4. **Reset de Navegación**
   - Seguridad: Usuario no puede volver a pantallas privadas
   - Privacidad: Limpia todo el historial
   - Performance: Libera memoria de pantallas anteriores

### Tecnologías y Conceptos Aplicados

- **React Hooks**: `useContext` para estado global
- **React Navigation**: Navegación entre pantallas, `CommonActions` para reset
- **AsyncStorage**: Persistencia de datos del usuario
- **Component Props**: Paso de parámetros a componentes
- **Alert API**: Diálogos nativos de confirmación
- **React Native Vector Icons**: Íconos consistentes

### Testing Realizado

✅ Navegación desde logo funciona  
✅ Logout con confirmación funciona  
✅ Limpieza de AsyncStorage completa  
✅ Reset de navegación exitoso  
✅ Header se ve igual en todas las pantallas  
✅ Username se muestra correctamente  

---

## 📝 Commits Realizados

```bash
11. add common header component with logo and logout functionality
    - Creado componente Header reutilizable
    - Agregado logo de Social Z
    - Implementado función logout con confirmación
    - Agregado updateUser en AuthContext

12. integrate header component in home and profile screens
    - Integrado Header en HomeScreen
    - Integrado Header en ProfileScreen
    - Removidos headers duplicados

13. fix logout functionality to properly clear session and navigate to login
    - Mejorado logout para limpiar AsyncStorage completamente
    - Agregado CommonActions.reset para navegación forzada
    - Probado flujo completo de logout

14. add header to all main screens and hide default tab headers
    - Agregado Header a FollowersScreen
    - Agregado Header a FollowingScreen
    - Configurado headerShown: false en MainTabs
    - Removidos headers duplicados de React Navigation
```

---

## 🚀 Próximos Pasos Sugeridos

### Mejoras al Header
- [ ] Agregar notificaciones badge
- [ ] Agregar botón de búsqueda
- [ ] Agregar menú desplegable con más opciones
- [ ] Animaciones al presionar botones

### Funcionalidades Adicionales
- [ ] Pantalla de Settings/Configuración
- [ ] Opción "Cambiar cuenta" sin logout completo
- [ ] Modo oscuro/claro (toggle en header)
- [ ] Contador de notificaciones en tiempo real

---

## 📞 Resumen Ejecutivo

### Lo que hicimos:
Creamos un **Header común reutilizable** que aparece en todas las pantallas principales de la aplicación, proporcionando navegación consistente y acceso rápido a funciones clave como logout.

### Por qué es importante:
- ✅ Mejora la **experiencia de usuario** con navegación intuitiva
- ✅ Implementa **best practices** de desarrollo móvil
- ✅ Demuestra comprensión de **componentes reutilizables**
- ✅ Maneja correctamente **estado global** y **persistencia de datos**
- ✅ Aplica **patrones de diseño** profesionales

### Resultado:
Una aplicación con navegación profesional, similar a redes sociales populares como Twitter/X, Instagram o Facebook.

---

**Fecha de Documentación**: 6 de Noviembre, 2025  
**Autor**: Juan Pablo (wartt)  
**Proyecto**: Social_Z - Aplicación móvil de red social  
**Feature**: Common Header Component  
**Branch**: `feature/user-profile`  
**Commits**: 11-14 (4 commits nuevos)
