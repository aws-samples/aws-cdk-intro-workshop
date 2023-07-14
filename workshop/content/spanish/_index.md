---
title: "AWS CDK Workshop Introductorio"
chapter: true
weight: 1
---
![](/images/favicon.png)
{.right-aligned}

# Bienvenidos Desarrolladores!

Hola, y gracias por unirte! Esperamos que estés impaciente por probar esta nueva cosa que 
llamamos el "AWS Cloud Development Kit" o más corto: el AWS CDK.

El AWS CDK es un framework nuevo de desarrollo de software de AWS, con el único propósito 
de hacer que definir infraestructura en la nube sea entretenido y fácil, con sus lenguajes 
de programación favoritos y desplegándola con AWS CloudFormation.

Entonces, qué construiremos? Nada muy complejo...

Pasaremos un tiempo configurando nuestro ambiente de desarrollo y aprendiendo un poco sobre 
cómo trabajar con las herramientas de CDK para desplegar la aplicación en un ambiente de AWS.

Luego, escribiremos una pequeña función Lambda de "Hola, mundo!", y pondremos delante de ella 
un endpoint de API Gateway para que usuarios puedan llamarla con una solicitud HTTP.

A continuación introduciremos el poderoso concepto de __Constructos de CDK__.
Los constructos permiten empaquetar infraestructura en componentes reutilizables, que cualquiera
puede componer en sus aplicaciones. Te enseñaremos cómo escribir tus propios constructos.

Finalmente, te mostraremos cómo usar un constructo de una biblioteca externa, en tus stacks.

Al final de este workshop, podrás:

- Crear nuevas aplicaciones CDK<br/>
- Definir la aplicación de tu aplicación usando el AWS Construct Library<br/>
- Desplegar tus aplicaciones CDK a tu cuenta de AWS<br/>
- Definir tus propios constructos reutilizables<br/>
- Consumir constructos publicados por otras personas<br/>

También puedes encontrar una guía corta en cómo utilizar nuestro [Construct Hub](./70-construct-hub.html) 
al final de este workshop. Esta será una herramienta útil durante todos tus futuros proyectos con los CDKs.

## También mira

- [Guía de Usuario de AWS CDK (inglés)](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
- [Referencia de API de AWS CDK (inglés)](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html)

