[majo](../README.md) > ["wares"](../modules/_wares_.md) > [Wares](../classes/_wares_.wares.md)

# Class: Wares

make this class @external

## Hierarchy

**Wares**

## Index

### Constructors

* [constructor](_wares_.wares.md#constructor)

### Properties

* [middlewares](_wares_.wares.md#middlewares)

### Methods

* [run](_wares_.wares.md#run)
* [use](_wares_.wares.md#use)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Wares**(): [Wares](_wares_.wares.md)

*Defined in [wares.ts:8](https://github.com/janat08/majo/blob/4f1b677/src/wares.ts#L8)*

**Returns:** [Wares](_wares_.wares.md)

___

## Properties

<a id="middlewares"></a>

###  middlewares

**● middlewares**: *[Middleware](../modules/_index_.md#middleware)[]*

*Defined in [wares.ts:8](https://github.com/janat08/majo/blob/4f1b677/src/wares.ts#L8)*

___

## Methods

<a id="run"></a>

###  run

▸ **run**(context: *`any`*): `Promise`<`void`>

*Defined in [wares.ts:19](https://github.com/janat08/majo/blob/4f1b677/src/wares.ts#L19)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| context | `any` |

**Returns:** `Promise`<`void`>

___
<a id="use"></a>

###  use

▸ **use**(middleware: *[Middleware](../modules/_index_.md#middleware)[]*): `this`

*Defined in [wares.ts:13](https://github.com/janat08/majo/blob/4f1b677/src/wares.ts#L13)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| middleware | [Middleware](../modules/_index_.md#middleware)[] |

**Returns:** `this`

___

