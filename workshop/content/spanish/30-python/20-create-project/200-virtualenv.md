+++
title = "Activar el virtualenv"
weight = 200
+++

## Activar el Virtualenv

El script de inicio que ejecutamos en el último paso creó un montón de código para ayudarnos a llegar
comenzó, pero también creó un entorno virtual dentro de nuestro directorio. Si tú
no has usado virtualenv antes, puedes obtener más información
[aquí](https://docs.python.org/3/tutorial/venv.html) pero la conclusión es
que permiten tener un entorno autónomo y aislado para ejecutar Python
e instale paquetes arbitrarios sin contaminar el Python de su sistema.

Para aprovechar el entorno virtual que se creó, debe
activarlo dentro de su shell. El archivo README generado proporciona todo esto
información, pero la mencionamos aquí porque es importante. Para
activa tu virtualenv en una plataforma Linux o macOS:

```
source .venv/bin/activate
```

En una plataforma Windows, utilizaría esto:

```
.venv\Scripts\activate.bat
```

Ahora que el entorno virtual está activado, puede instalar de forma segura el
módulos de python necesarios.

```
pip install -r requirements.txt
```
