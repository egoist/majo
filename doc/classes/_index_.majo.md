[majo](../README.md) > ["index"](../modules/_index_.md) > [Majo](../classes/_index_.majo.md)

# Class: Majo

## Hierarchy

 `EventEmitter`

**↳ Majo**

## Index

### Constructors

* [constructor](_index_.majo.md#constructor)

### Properties

* [baseDir](_index_.majo.md#basedir)
* [dotFiles](_index_.majo.md#dotfiles)
* [files](_index_.majo.md#files)
* [meta](_index_.majo.md#meta)
* [middlewares](_index_.majo.md#middlewares)
* [sourcePatterns](_index_.majo.md#sourcepatterns)

### Accessors

* [fileList](_index_.majo.md#filelist)

### Methods

* [createFile](_index_.majo.md#createfile)
* [deleteFile](_index_.majo.md#deletefile)
* [dest](_index_.majo.md#dest)
* [file](_index_.majo.md#file)
* [fileContents](_index_.majo.md#filecontents)
* [fileStats](_index_.majo.md#filestats)
* [filter](_index_.majo.md#filter)
* [process](_index_.majo.md#process)
* [rename](_index_.majo.md#rename)
* [source](_index_.majo.md#source)
* [transform](_index_.majo.md#transform)
* [use](_index_.majo.md#use)
* [writeContents](_index_.majo.md#writecontents)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Majo**(): [Majo](_index_.majo.md)

*Defined in [index.ts:31](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L31)*

**Returns:** [Majo](_index_.majo.md)

___

## Properties

<a id="basedir"></a>

###  baseDir

**● baseDir**: *`string`*

*Defined in [index.ts:18](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L18)*

___
<a id="dotfiles"></a>

###  dotFiles

**● dotFiles**: *`boolean`*

*Defined in [index.ts:20](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L20)*

___
<a id="files"></a>

###  files

**● files**: *`object`*

*Defined in [index.ts:22](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L22)*

#### Type declaration

[relativePath: `string`]: [File](../modules/_index_.md#file)

___
<a id="meta"></a>

###  meta

**● meta**: *`object`*

*Defined in [index.ts:17](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L17)*

#### Type declaration

[k: `string`]: `any`

___
<a id="middlewares"></a>

###  middlewares

**● middlewares**: *[Middleware](../modules/_index_.md#middleware)[]*

*Defined in [index.ts:21](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L21)*

___
<a id="sourcepatterns"></a>

###  sourcePatterns

**● sourcePatterns**: *[Glob](../modules/_index_.md#glob)*

*Defined in [index.ts:19](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L19)*

___

## Accessors

<a id="filelist"></a>

###  fileList

**get fileList**(): `string`[]

*Defined in [index.ts:212](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L212)*

Get an array of sorted file paths

**Returns:** `string`[]

___

## Methods

<a id="createfile"></a>

###  createFile

▸ **createFile**(relativePath: *`string`*, file: *[File](../modules/_index_.md#file)*): `this`

*Defined in [index.ts:203](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L203)*

Create a new file

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| relativePath | `string` |  Relative path |
| file | [File](../modules/_index_.md#file) |   |

**Returns:** `this`

___
<a id="deletefile"></a>

###  deleteFile

▸ **deleteFile**(relativePath: *`string`*): `this`

*Defined in [index.ts:193](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L193)*

Delete a file

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| relativePath | `string` |  Relative path |

**Returns:** `this`

___
<a id="dest"></a>

###  dest

▸ **dest**(dest: *`string`*, __namedParameters?: *`object`*): `Promise`<`this`>

*Defined in [index.ts:130](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L130)*

Run middlewares and write processed files to disk

**Parameters:**

**dest: `string`**

Target directory

**`Default value` __namedParameters: `object`**

| Name | Type | Default value |
| ------ | ------ | ------ |
| baseDir | `string` | &quot;.&quot; |
| clean | `boolean` | false |

**Returns:** `Promise`<`this`>

___
<a id="file"></a>

###  file

▸ **file**(relativePath: *`string`*): `object`

*Defined in [index.ts:185](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L185)*

Get a file by relativePath path

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| relativePath | `string` |  Relative path<br><br> |

**Returns:** `object`

___
<a id="filecontents"></a>

###  fileContents

▸ **fileContents**(relativePath: *`string`*): `string`

*Defined in [index.ts:157](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L157)*

Get file contents as a UTF-8 string

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| relativePath | `string` |  Relative path<br><br> |

**Returns:** `string`

___
<a id="filestats"></a>

###  fileStats

▸ **fileStats**(relativePath: *`string`*): `Stats`

*Defined in [index.ts:176](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L176)*

Get the fs.Stats object of specified file

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| relativePath | `string` |  Relative path<br><br> |

**Returns:** `Stats`

___
<a id="filter"></a>

###  filter

▸ **filter**(fn: *`function`*): `this`

*Defined in [index.ts:96](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L96)*

Filter files

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| fn | `function` |  Filter handler |

**Returns:** `this`

___
<a id="process"></a>

###  process

▸ **process**(): `Promise`<`this`>

*Defined in [index.ts:68](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L68)*

Process middlewares against files

**Returns:** `Promise`<`this`>

___
<a id="rename"></a>

###  rename

▸ **rename**(fromPath: *`string`*, toPath: *`string`*): `this`

*Defined in [index.ts:216](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L216)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| fromPath | `string` |
| toPath | `string` |

**Returns:** `this`

___
<a id="source"></a>

###  source

▸ **source**(patterns: *[Glob](../modules/_index_.md#glob)*, __namedParameters?: *`object`*): `this`

*Defined in [index.ts:49](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L49)*

Find files from specific directory

**Parameters:**

**patterns: [Glob](../modules/_index_.md#glob)**

**`Default value` __namedParameters: `object`**

| Name | Type | Default value |
| ------ | ------ | ------ |
| baseDir | `string` | &quot;.&quot; |
| dotFiles | `boolean` | true |

**Returns:** `this`

___
<a id="transform"></a>

###  transform

▸ **transform**(relativePath: *`string`*, fn: *`function`*): `undefined` \| `Promise`<`void`>

*Defined in [index.ts:111](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L111)*

Transform file at given path

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| relativePath | `string` |  Relative path |
| fn | `function` |  Transform handler |

**Returns:** `undefined` \| `Promise`<`void`>

___
<a id="use"></a>

###  use

▸ **use**(middleware: *[Middleware](../modules/_index_.md#middleware)*): `this`

*Defined in [index.ts:60](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L60)*

Use a middleware

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| middleware | [Middleware](../modules/_index_.md#middleware) |   |

**Returns:** `this`

___
<a id="writecontents"></a>

###  writeContents

▸ **writeContents**(relativePath: *`string`*, string: *`string`*): `this`

*Defined in [index.ts:166](https://github.com/janat08/majo/blob/4f1b677/src/index.ts#L166)*

Write contents to specific file

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| relativePath | `string` |  Relative path |
| string | `string` |  File content as a UTF-8 string |

**Returns:** `this`

___

