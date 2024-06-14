+++
title = "Construct Hub Interno"
weight = 200
bookFlatSection = true
+++

# Construct Hub Interno

Cómo podría usted compartir constructos con otros miembros de su organización? Existe el <a href="https://constructs.dev/" target="_blank">Construct Hub</a> pero este es un sitio público al que cualquier persona en el mundo puede tener acceso.  Y quizás sus constructos cuentan con Propiedad Intelectual (PI) interna o son parte de una iniciativa competitiva de investigación y desarrollo. Probablemente sea en contra de las políticas de la compañía exponer este tipo de información.

Afortunadamente para usted, el Construct Hub es en sí mismo un Constructo de CDK!  Esto significa que usted puede desplegarlo en una cuenta de AWS y solo permitir el acceso a recursos internos. De esta manera usted puede compartir sus constructos con miembros de su equipo o su organización sin exponerlos al mundo externo.

![](./100-internal-construct-hub/internal-construct-hub.png)

Para habilitar esta funcionalidad, usted desplegará la arquitectura mostrada en el diagrama anterior.

Típicamente hay 3 tipos de usuarios que aprovecharán de alguna manera el Construct Hub Interno:

1. Administradores del Construct Hub Interno - Estos individuos serán responsables del manejar el Construct Hub Interno y de la canalización que despliega constructos en él.

2. Productores del Construct Hub Interno - Desarroladores que publicarán constructos al Construct Hub Interno

3. Consumidores del Construct Hub Interno - Desarrolladores que navegaran al Construct Hub Interno buscando constructos útiles de CDK 

Las secciones siguientes están asignadas a las necesidades de estos tipos de usuarios. En la siguiente sección, revisaremos la configuración inicial antes de desplegar el _front-end_ del Construct Hub Interno (el cuadro llamado "Internal ConstructHub" en el diagrama anterior).
