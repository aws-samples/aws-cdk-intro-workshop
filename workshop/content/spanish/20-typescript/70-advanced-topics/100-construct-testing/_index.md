+++
title = "Probando Constructos"
weight = 100
bookCollapseSection = true

+++

## Probando Constructos (Opcional)

La [Guía para Desarroladores](https://docs.aws.amazon.com/cdk/latest/guide/testing.html) provee un buen ejemplo para probar constructos. Para esta sección del workshop utilizaremos [Aserciones Detalladas](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_fine_grained) y pruebas de tipo de [Validación](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_validation).

#### Biblioteca de aserciones CDK

Utilizaremos la biblioteca de aserciones (`assertions`) de CDK (`aws_cdk.assertions`) a través de esta sección.
Esta biblioteca contiene varias funciones auxiliares para escribir pruebas unitarias y de integración.

Para este workshop utilizaremos principalmente la función `hasResourceProperties`. Esta función auxiliar es utilizada cuando a usted solo le interesa que un recurso de un tipo en particular exista (independiente de su identificador lógico), y que _algunas_ de sus propiedades tengan asignados valores específicos.

Por ejemplo:

```ts
template.hasResourceProperties('AWS::CertificateManager::Certificate', {
    DomainName: 'test.example.com',

    ShouldNotExist: Match.absent(),
    // Note: some properties omitted here
});
```

`Match.absent()` puede ser utilizada para asegurar que una llave en particular en un objeto *no* está asignada (o está asignada a `undefined`).

Para ver el resto de la documentación, por favor lea los docs [aquí](https://docs.aws.amazon.com/cdk/api/latest/python/aws_cdk.assertions/README.html).
