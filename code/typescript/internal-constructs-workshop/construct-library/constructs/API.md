# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### HitCounter <a name="HitCounter" id="cdkworkshop-lib.HitCounter"></a>

#### Initializers <a name="Initializers" id="cdkworkshop-lib.HitCounter.Initializer"></a>

```typescript
import { HitCounter } from 'cdkworkshop-lib'

new HitCounter(scope: Construct, id: string, props: HitCounterProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdkworkshop-lib.HitCounter.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdkworkshop-lib.HitCounter.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdkworkshop-lib.HitCounter.Initializer.parameter.props">props</a></code> | <code><a href="#cdkworkshop-lib.HitCounterProps">HitCounterProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdkworkshop-lib.HitCounter.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdkworkshop-lib.HitCounter.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdkworkshop-lib.HitCounter.Initializer.parameter.props"></a>

- *Type:* <a href="#cdkworkshop-lib.HitCounterProps">HitCounterProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdkworkshop-lib.HitCounter.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdkworkshop-lib.HitCounter.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdkworkshop-lib.HitCounter.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdkworkshop-lib.HitCounter.isConstruct"></a>

```typescript
import { HitCounter } from 'cdkworkshop-lib'

HitCounter.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdkworkshop-lib.HitCounter.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdkworkshop-lib.HitCounter.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdkworkshop-lib.HitCounter.property.handler">handler</a></code> | <code>aws-cdk-lib.aws_lambda.Function</code> | allows accessing the counter function. |
| <code><a href="#cdkworkshop-lib.HitCounter.property.table">table</a></code> | <code>aws-cdk-lib.aws_dynamodb.Table</code> | the hit counter table. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdkworkshop-lib.HitCounter.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `handler`<sup>Required</sup> <a name="handler" id="cdkworkshop-lib.HitCounter.property.handler"></a>

```typescript
public readonly handler: Function;
```

- *Type:* aws-cdk-lib.aws_lambda.Function

allows accessing the counter function.

---

##### `table`<sup>Required</sup> <a name="table" id="cdkworkshop-lib.HitCounter.property.table"></a>

```typescript
public readonly table: Table;
```

- *Type:* aws-cdk-lib.aws_dynamodb.Table

the hit counter table.

---


## Structs <a name="Structs" id="Structs"></a>

### HitCounterProps <a name="HitCounterProps" id="cdkworkshop-lib.HitCounterProps"></a>

#### Initializer <a name="Initializer" id="cdkworkshop-lib.HitCounterProps.Initializer"></a>

```typescript
import { HitCounterProps } from 'cdkworkshop-lib'

const hitCounterProps: HitCounterProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdkworkshop-lib.HitCounterProps.property.downstream">downstream</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | the function for which we want to count url hits *. |
| <code><a href="#cdkworkshop-lib.HitCounterProps.property.readCapacity">readCapacity</a></code> | <code>number</code> | *No description.* |

---

##### `downstream`<sup>Required</sup> <a name="downstream" id="cdkworkshop-lib.HitCounterProps.property.downstream"></a>

```typescript
public readonly downstream: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

the function for which we want to count url hits *.

---

##### `readCapacity`<sup>Optional</sup> <a name="readCapacity" id="cdkworkshop-lib.HitCounterProps.property.readCapacity"></a>

```typescript
public readonly readCapacity: number;
```

- *Type:* number

---



