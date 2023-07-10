+++
title = "Probando Constructos"
weight = 100
bookCollapseSection = true

+++

## Probando Constructos (Opcional)

La [Guía para Desarroladores](https://docs.aws.amazon.com/cdk/latest/guide/testing.html) provee un buen ejemplo para probar constructos. Para esta sección del workshop utilizaremos [Aserciones Detalladas](https://docs.aws.amazon.com/cdk/latest/guide/testing.html#testing_fine_grained).

#### Biblioteca de aserciones CDK

Utilizaremos la [biblioteca](https://www.nuget.org/packages/Amazon.CDK.Assertions/) de aserciones (`assertions`) de CDK (`Amazon.CDK.Assertions`) a través de esta sección.
Esta biblioteca contiene varias funciones auxiliares para escribir pruebas unitarias y de integración.

Para este workshop utilizaremos principalmente la función `HasResourceProperties`. Esta función auxiliar es utilizada cuando a usted solo le interesa que un recurso de un tipo en particular exista (independiente de su identificador lógico), y que _algunas_ de sus propiedades tengan asignados valores específicos.

Por ejemplo:

```cs
template.HasResourceProperties("AWS::Lambda::Function", new Dictionary<string, object> {
    { "Handler", "hitcounter.handler" },
    { "Environment", Match.AnyValue() }
});
```

`Match.AnyValue()` puede ser utilizada para asegurar que una llave en particular en un objeto está asignada a algún valor.

Para ver el resto de la documentación, por favor lea los docs [aquí](https://www.fuget.org/packages/Amazon.CDK.Assertions/1.194.0).
