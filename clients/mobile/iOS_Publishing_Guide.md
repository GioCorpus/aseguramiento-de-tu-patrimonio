# Guía de Publicación y Distribución en iOS (Apple App Store)

Esta guía detalla los pasos requeridos para compilar, firmar digitalmente y subir la aplicación de **Asegura tu Patrimonio** a la **Apple App Store** y **TestFlight**.

---

## 📋 Prerrequisitos

1. **Cuenta de Desarrollador de Apple**: Cuenta de tipo individual o de organización activa en [Apple Developer Program](https://developer.apple.com/programs/).
2. **Mac con macOS**: Se requiere macOS Monterey o superior.
3. **Xcode**: Instalado desde la Mac App Store (Versión 14 o superior).
4. **CocoaPods & Ruby**: Instalados en el sistema para la gestión de dependencias nativas de iOS.

---

## 🔑 Firma de Código y Certificados

Para subir a la App Store, la aplicación debe estar firmada con un certificado de tipo **iOS Distribution** y vinculada a un perfil de aprovisionamiento (**App Store Provisioning Profile**).

### Opción A: Automatizado con Fastlane Match (Recomendado)
Fastlane Match cifra tus certificados y los almacena en un repositorio git privado para que todo tu equipo comparta la misma firma:

1. **Inicializar Match** (Si es la primera vez):
   ```bash
   fastlane match init
   ```
2. **Generar y Sincronizar Certificados**:
   ```bash
   fastlane match appstore
   ```
   *Esto generará automáticamente los certificados de distribución en el portal de desarrolladores de Apple y los guardará en tu repositorio git privado de firmas.*

### Opción B: Firma Manual desde Xcode
Si prefieres no usar match y firmar de manera tradicional:
1. Abre `/ios/AseguraPatrimonio.xcworkspace` en **Xcode**.
2. Ve a los ajustes del proyecto haciendo clic en la raíz del árbol de archivos.
3. Abre la pestaña **Signing & Capabilities**.
4. Activa **"Automatically manage signing"** y selecciona tu **Development Team** de Apple.

---

## 🚀 Compilación y Envío con Fastlane

Hemos configurado un pipeline automatizado con Fastlane en `ios/fastlane/Fastfile`. Asegúrate de estar dentro del directorio `ios/` para ejecutar los comandos.

### 1. Enviar a TestFlight para Pruebas Internas (Beta)
El carril `beta` incrementa el número de compilación, descarga tus certificados de distribución mediante Match, compila el archivo `.ipa` optimizado y lo sube directamente a TestFlight:
```bash
cd ios
fastlane beta
```

### 2. Enviar a Revisión de la App Store (Producción)
El carril `release` realiza las mismas tareas pero sube el archivo directo a la cola de publicación de producción en App Store Connect:
```bash
cd ios
fastlane release
```

---

## 🛠️ Compilación Manual desde Xcode

Si prefieres realizar el proceso visualmente:

1. Abre el espacio de trabajo en Xcode:
   ```bash
   open ios/AseguraPatrimonio.xcworkspace
   ```
2. Instala las dependencias de CocoaPods (si no están instaladas):
   ```bash
   cd ios && pod install && cd ..
   ```
3. En la barra superior de Xcode, selecciona el dispositivo de destino como **"Any iOS Device (arm64)"**.
4. Ve al menú superior **Product > Archive**.
5. Espera a que termine la compilación. Se abrirá la ventana **Organizer**.
6. Haz clic en **"Distribute App"**, selecciona **"App Store Connect"** y sigue los pasos en pantalla para firmar y subir el archivo binario.

---

## 📝 Ficha Técnica en App Store Connect

Una vez subido el binario:
1. Ve a [App Store Connect](https://appstoreconnect.apple.com/) y selecciona tu aplicación.
2. Agrega la información requerida:
   - **Descripción** e **Palabras clave**.
   - **Capturas de pantalla** oficiales para iPhones de 6.5 pulgadas e iPads.
   - **URL de política de privacidad** (Obligatorio por ley).
3. Selecciona la compilación que subiste mediante Fastlane/Xcode.
4. Completa la clasificación de edad de la aplicación.
5. Haz clic en **"Enviar para revisión"**.
