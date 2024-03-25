+++
title = "Probando Constructos"
weight = 100
bookCollapseSection = true
+++

## Probando Constructos (Opcional)

La [Guía para Desarroladores](https://docs.aws.amazon.com/cdk/latest/guide/testing.html) provee un buen ejemplo para probar constructos. Para esta sección del workshop utilizaremos [Aserciones Detalladas](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_fine_grained) y pruebas de tipo de [Validación](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_validation).

### Prerrequisitos

1. Instalar los paquetes de pruebas requeridos.

Edite el archivo `pom.xml` para agregar las siguientes dependencias:

{{<highlight xml "hl_lines=8-13">}}
<?xml version="1.0" encoding="UTF-8"?>
<project xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd"
         xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <dependencies>

        ...

        <dependency>
            <groupId>org.assertj</groupId>
            <artifactId>assertj-core</artifactId>
            <version>3.18.1</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
{{</highlight>}}

#### Biblioteca de aserciones CDK

Utilizaremos la biblioteca de aserciones (`assertions`) de CDK (`software.amazon.awscdk.assertions`) a través de esta sección.
Esta biblioteca contiene varias funciones auxiliares para escribir pruebas unitarias y de integración.

Para este workshop utilizaremos principalmente la función `hasResourceProperties`. Esta función auxiliar es utilizada cuando a usted solo le interesa que un recurso de un tipo en particular exista (independiente de su identificador lógico), y que _algunas_ de sus propiedades tengan asignados valores específicos.

Por ejemplo:

```java
Map<String, Object> expected = Map.of(
    "DomainName", "test.example.com",
)
template.hasResourceProperties("AWS::CertificateManager::Certificate", expected);
```

Para ver el resto de la documentación, por favor lea los docs [aquí](https://github.com/aws/aws-cdk/blob/master/packages/%40aws-cdk/assertions/README.md).
