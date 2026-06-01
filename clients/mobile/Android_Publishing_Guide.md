# Guía de Publicación y Distribución en Android (Google Play Store)

Esta guía detalla el proceso completo para generar el keystore de firma de producción, configurar el acceso automatizado por API a Google Play y publicar la aplicación de **Asegura tu Patrimonio** en la **Google Play Store**.

---

## 🔑 1. Generación de Keystore de Producción

Para que la Play Store acepte la aplicación, esta debe firmarse con una clave criptográfica única. 

### Crear la Clave:
En tu terminal (en Windows, puedes usar Git Bash o PowerShell), ejecuta el siguiente comando para generar tu archivo de claves (`keystore`):

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore asegura-patrimonio.keystore -alias asegura-alias -keyalg RSA -keysize 2048 -validity 10000
```
*Te solicitará una contraseña segura. Guárdala en un lugar seguro (como un administrador de contraseñas), ya que perder este archivo o contraseña impedirá subir actualizaciones de la app en el futuro.*

### Configurar Gradle:
Mueve el archivo `asegura-patrimonio.keystore` a la carpeta `android/app/`. 

Para evitar subir contraseñas a Git, agrégalas a tu archivo local de variables globales de Gradle en tu computadora (`~/.gradle/gradle.properties` o en `android/gradle.properties` agregándolo al `.gitignore`):

```properties
MYAPP_UPLOAD_STORE_FILE=asegura-patrimonio.keystore
MYAPP_UPLOAD_STORE_PASSWORD=tu_contraseña_segura
MYAPP_UPLOAD_KEY_ALIAS=asegura-alias
MYAPP_UPLOAD_KEY_PASSWORD=tu_contraseña_segura
```

---

## 🤖 2. Configurar Acceso de API de Google Play Console

Para automatizar las subidas con Fastlane, necesitamos un archivo JSON de credenciales de una cuenta de servicio:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto o selecciona el proyecto vinculado a tu aplicación.
3. Ve a **IAM y administración > Cuentas de servicio** y haz clic en **Crear cuenta de servicio**.
4. Nómbrala `fastlane-play-store` y asígnale el rol de **Administrador de Google Play**.
5. Crea una clave en formato **JSON** y descárgala.
6. Renombra el archivo a `fastlane-google-service-account.json` y guárdalo en la carpeta `android/` (asegúrate de que esté listado en tu `.gitignore`).
7. Ve a [Google Play Console](https://play.google.com/console/) bajo **Configuración > Acceso a la API** y vincula la cuenta de servicio autorizándola con permisos de publicación.

---

## 🚀 3. Compilación y Publicación Automatizada con Fastlane

El archivo `Fastfile` configurado en `android/fastlane/Fastfile` contiene pipelines listos para ser ejecutados.

### Enviar a Pruebas Internas (Beta):
Compila automáticamente la app en formato de paquete universal de Android App Bundle (`.aab`) optimizado para Play Store y lo sube directamente a la pista de pruebas internas de Google Play Console:
```bash
cd android
fastlane beta
```

### Enviar a Producción:
Sube el binario compilado directo a la pista principal para su revisión y distribución mundial:
```bash
cd android
fastlane release
```

---

## 🛠️ 4. Compilación Manual de Producción (.AAB)

Si prefieres compilar sin Fastlane y subir el archivo manualmente a Google Play Console:

1. Navega al directorio nativo de Android:
   ```bash
   cd android
   ```
2. Limpia compilaciones anteriores:
   ```bash
   ./gradlew clean
   ```
3. Genera el Android App Bundle firmado:
   ```bash
   ./gradlew bundleRelease
   ```
4. El archivo binario resultante se guardará en:
   `android/app/build/outputs/bundle/release/app-release.aab`
5. Sube este archivo `.aab` directamente a tu consola en [Google Play Console](https://play.google.com/console/).

---

## 📝 5. Ficha de Play Store

Para completar la publicación de tu aplicación:
1. Completa las tareas iniciales obligatorias de la Play Store (Declaraciones de privacidad, anuncios, contenido apto para niños).
2. Sube capturas de pantalla para teléfonos y tablets de 7/10 pulgadas.
3. Escribe un título oficial, descripción corta (hasta 80 caracteres) y descripción larga.
4. Vincula el archivo de políticas de privacidad.
5. Inicia el lanzamiento de tu release subido por Fastlane para comenzar la revisión de Google.
