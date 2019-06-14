[majo](../README.md) > ["index"](../modules/_index_.md) > [Majo](../classes/_index_.majo.md)

# Class: Majo

My custom event emitter

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

*Defined in [index.ts:26](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L26)*

**Returns:** [Majo](_index_.majo.md)

___

## Properties

<a id="basedir"></a>

###  baseDir

**● baseDir**: *`string`*

*Defined in [index.ts:14](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L14)*

___
<a id="dotfiles"></a>

###  dotFiles

**● dotFiles**: *`boolean`*

*Defined in [index.ts:16](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L16)*

___
<a id="files"></a>

###  files

**● files**: *`object`*

*Defined in [index.ts:18](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L18)*

#### Type declaration

[relativePath: `string`]: [File](../modules/_index_.md#file)

___
<a id="meta"></a>

###  meta

**● meta**: *`object`*

*Defined in [index.ts:13](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L13)*

#### Type declaration

[k: `string`]: `any`

___
<a id="middlewares"></a>

###  middlewares

**● middlewares**: *[Middleware](../modules/_index_.md#middleware)[]*

*Defined in [index.ts:17](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L17)*

___
<a id="sourcepatterns"></a>

###  sourcePatterns

**● sourcePatterns**: *[Glob](../modules/_index_.md#glob)*

*Defined in [index.ts:15](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L15)*

___

## Accessors

<a id="filelist"></a>

###  fileList

**get fileList**(): `string`[]

*Defined in [index.ts:207](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L207)*

Get an array of sorted file paths

**Returns:** `string`[]

___

## Methods

<a id="createfile"></a>

###  createFile

▸ **createFile**(relativePath: *`string`*, file: *[File](../modules/_index_.md#file)*): `this`

*Defined in [index.ts:198](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L198)*

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

*Defined in [index.ts:188](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L188)*

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

*Defined in [index.ts:125](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L125)*

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

*Defined in [index.ts:180](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L180)*

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

*Defined in [index.ts:152](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L152)*

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

*Defined in [index.ts:171](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L171)*

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

*Defined in [index.ts:91](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L91)*

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

*Defined in [index.ts:63](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L63)*

Process middlewares against files

**Returns:** `Promise`<`this`>

___
<a id="rename"></a>

###  rename

▸ **rename**(fromPath: *`string`*, toPath: *`string`*): `this`

*Defined in [index.ts:211](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L211)*

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

*Defined in [index.ts:44](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L44)*

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

*Defined in [index.ts:106](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L106)*

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

*Defined in [index.ts:55](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L55)*

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

*Defined in [index.ts:161](https://github.com/janat08/majo/blob/17b9c40/src/index.ts#L161)*

Write contents to specific file

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| relativePath | `string` |  Relative path |
| string | `string` |  File content as a UTF-8 string |

**Returns:** `this`

___

