<a name="Majo"></a>

## Majo
<p>My custom event emitter</p>

**Kind**: global class  
**Noinheritdoc**:   

* [Majo](#Majo)
    * [.meta](#Majo+meta)
    * [.fileList](#Majo+fileList)
    * [.source(source, opts)](#Majo+source)
    * [.use(middleware)](#Majo+use)
    * [.process()](#Majo+process)
    * [.filter(fn)](#Majo+filter)
    * [.transform(relativePath, fn)](#Majo+transform)
    * [.dest(dest, opts)](#Majo+dest)
    * [.fileContents(relativePath)](#Majo+fileContents)
    * [.writeContents(relativePath, string)](#Majo+writeContents)
    * [.fileStats(relativePath)](#Majo+fileStats)
    * [.file(relativePath)](#Majo+file)
    * [.deleteFile(relativePath)](#Majo+deleteFile)
    * [.createFile(relativePath, file)](#Majo+createFile)

<a name="Majo+meta"></a>

### majo.meta
<p>An object you can use across middleware to share states</p>

**Kind**: instance property of [<code>Majo</code>](#Majo)  
<a name="Majo+fileList"></a>

### majo.fileList
<p>Get an array of sorted file paths</p>

**Kind**: instance property of [<code>Majo</code>](#Majo)  
<a name="Majo+source"></a>

### majo.source(source, opts)
<p>Find files from specific directory</p>

**Kind**: instance method of [<code>Majo</code>](#Majo)  

| Param | Description |
| --- | --- |
| source | <p>Glob patterns</p> |
| opts |  |
| opts.baseDir | <p>The base directory to find files</p> |
| opts.dotFiles | <p>Including dot files</p> |

<a name="Majo+use"></a>

### majo.use(middleware)
<p>Use a middleware</p>

**Kind**: instance method of [<code>Majo</code>](#Majo)  

| Param |
| --- |
| middleware | 

<a name="Majo+process"></a>

### majo.process()
<p>Process middlewares against files</p>

**Kind**: instance method of [<code>Majo</code>](#Majo)  
<a name="Majo+filter"></a>

### majo.filter(fn)
<p>Filter files</p>

**Kind**: instance method of [<code>Majo</code>](#Majo)  

| Param | Description |
| --- | --- |
| fn | <p>Filter handler</p> |

<a name="Majo+transform"></a>

### majo.transform(relativePath, fn)
<p>Transform file at given path</p>

**Kind**: instance method of [<code>Majo</code>](#Majo)  

| Param | Description |
| --- | --- |
| relativePath | <p>Relative path</p> |
| fn | <p>Transform handler</p> |

<a name="Majo+dest"></a>

### majo.dest(dest, opts)
<p>Run middlewares and write processed files to disk</p>

**Kind**: instance method of [<code>Majo</code>](#Majo)  

| Param | Description |
| --- | --- |
| dest | <p>Target directory</p> |
| opts |  |
| opts.baseDir | <p>Base directory to resolve target directory</p> |
| opts.clean | <p>Clean directory before writing</p> |

<a name="Majo+fileContents"></a>

### majo.fileContents(relativePath)
<p>Get file contents as a UTF-8 string</p>

**Kind**: instance method of [<code>Majo</code>](#Majo)  

| Param | Description |
| --- | --- |
| relativePath | <p>Relative path</p> |

<a name="Majo+writeContents"></a>

### majo.writeContents(relativePath, string)
<p>Write contents to specific file</p>

**Kind**: instance method of [<code>Majo</code>](#Majo)  

| Param | Description |
| --- | --- |
| relativePath | <p>Relative path</p> |
| string | <p>File content as a UTF-8 string</p> |

<a name="Majo+fileStats"></a>

### majo.fileStats(relativePath)
<p>Get the fs.Stats object of specified file</p>

**Kind**: instance method of [<code>Majo</code>](#Majo)  

| Param | Description |
| --- | --- |
| relativePath | <p>Relative path</p> |

<a name="Majo+file"></a>

### majo.file(relativePath)
<p>Get a file by relativePath path</p>

**Kind**: instance method of [<code>Majo</code>](#Majo)  

| Param | Description |
| --- | --- |
| relativePath | <p>Relative path</p> |

<a name="Majo+deleteFile"></a>

### majo.deleteFile(relativePath)
<p>Delete a file</p>

**Kind**: instance method of [<code>Majo</code>](#Majo)  

| Param | Description |
| --- | --- |
| relativePath | <p>Relative path</p> |

<a name="Majo+createFile"></a>

### majo.createFile(relativePath, file)
<p>Create a new file</p>

**Kind**: instance method of [<code>Majo</code>](#Majo)  

| Param | Description |
| --- | --- |
| relativePath | <p>Relative path</p> |
| file |  |

