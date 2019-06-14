[majo](../README.md) > ["index"](../modules/_index_.md)

# External module: "index"

## Index

### Classes

* [Majo](../classes/_index_.majo.md)

### Type aliases

* [File](_index_.md#file)
* [Glob](_index_.md#glob)
* [Middleware](_index_.md#middleware)
* [TransformFn](_index_.md#transformfn)

### Functions

* [majo](_index_.md#majo-1)

---

## Type aliases

<a id="file"></a>

###  File

**Ƭ File**: *`object`*

*Defined in [index.ts:20](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L20)*

#### Type declaration

 contents: `Buffer`

 path: `string`

 stats: `Stats`

___
<a id="glob"></a>

###  Glob

**Ƭ Glob**: *`string` \| `string`[]*

*Defined in [index.ts:8](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L8)*

___
<a id="middleware"></a>

###  Middleware

**Ƭ Middleware**: *`function`*

*Defined in [index.ts:7](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L7)*

#### Type declaration
▸(ctx: *[Majo](../classes/_index_.majo.md)*): `Promise`<`void`> \| `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| ctx | [Majo](../classes/_index_.majo.md) |

**Returns:** `Promise`<`void`> \| `void`

___
<a id="transformfn"></a>

###  TransformFn

**Ƭ TransformFn**: *`function`*

*Defined in [index.ts:9](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L9)*

#### Type declaration
▸(contents: *`string`*): `Promise`<`string`> \| `string`

**Parameters:**

| Name | Type |
| ------ | ------ |
| contents | `string` |

**Returns:** `Promise`<`string`> \| `string`

___

## Functions

<a id="majo-1"></a>

### `<Const>` majo

▸ **majo**(): [Majo](../classes/_index_.majo.md)

*Defined in [index.ts:223](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L223)*

**Returns:** [Majo](../classes/_index_.majo.md)

___

