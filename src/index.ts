import path from 'path';
import { EventEmitter } from 'events';
import fs from 'fs-extra';
import glob from 'fast-glob';
import { Entry } from 'fast-glob/out/types/entries';
import Wares, { Middleware } from './wares';

type RelativePath = string;
type FilterHandler = (relativePath: string, file: MajoFile) => boolean;
type TransformHandler = (contents: string) => string | Promise<string>;

interface MajoFile {
  path: string;
  stats: fs.Stats;
  contents: Buffer;
}

interface SourceOptions {
  baseDir: string;
  dotFiles: boolean;
}

export class Majo extends EventEmitter {
  private middlewares: Middleware[] = [];

  /**
   * An object you can use across middleware to share states
   */
  private meta: Record<string, any> = {};

  private baseDir: string = '.';

  private sourcePatterns: string | string[] = [];

  private dotFiles: boolean = true;

  private files: Record<RelativePath, MajoFile> = {};

  /**
   * Find files from specific directory
   * @param {string | string[]} source Glob patterns
   * @param {MajoFile} opts
   * @param opts.baseDir The base directory to find files
   * @param opts.dotFiles Including dot files
   */
  source(patterns: string | string[], { baseDir = '.', dotFiles = true } = {}): Majo {
    this.baseDir = path.resolve(baseDir);
    this.sourcePatterns = patterns;
    this.dotFiles = dotFiles;
    return this;
  }

  /**
   * Use a middleware
   * @param {Middleware} middleware
   */
  use(middleware: Middleware): Majo {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Process middlewares against files
   */
  async process(): Promise<Majo> {
    const allStats = await glob<Entry>(this.sourcePatterns, {
      cwd: this.baseDir,
      dot: this.dotFiles,
      stats: true
    });

    this.files = {};

    await Promise.all(
      allStats.map(stats => {
        const absolutePath = path.resolve(this.baseDir, stats.path);
        return fs.readFile(absolutePath).then(contents => {
          const file = { contents, stats, path: absolutePath };
          this.files[stats.path] = file;
        });
      })
    );

    await new Wares().use(this.middlewares).run(this);

    return this;
  }

  /**
   * Filter files
   * @param {FilterHandler} fn Filter handler
   */
  filter(fn: FilterHandler): Majo {
    return this.use(context => {
      for (const relativePath in context.files) {
        if (!fn(relativePath, context.files[relativePath])) {
          delete context.files[relativePath];
        }
      }
    });
  }

  /**
   * Transform file at given path
   * @param {string} relativePath Relative path
   * @param {TransformHandler} fn Transform handler
   */
  transform(relativePath: string, fn: TransformHandler): void | Promise<void> {
    const contents = this.files[relativePath].contents.toString();
    const result = fn(contents);
    if (typeof result === 'string') {
      this.files[relativePath].contents = Buffer.from(result);
      return;
    }

    return result.then(newContents => {
      this.files[relativePath].contents = Buffer.from(newContents);
    });
  }

  /**
   * Run middlewares and write processed files to disk
   * @param {string} dest Target directory
   * @param {SourceOptions} opts
   * @param opts.baseDir Base directory to resolve target directory
   * @param opts.clean Clean directory before writing
   */
  async dest(dest: string, { baseDir = '.', clean = false } = {}): Promise<Majo> {
    const destPath = path.resolve(baseDir, dest);
    await this.process();

    if (clean) {
      await fs.remove(destPath);
    }

    await Promise.all(
      Object.keys(this.files).map(filename => {
        const { contents } = this.files[filename];
        const target = path.join(destPath, filename);
        this.emit('write', filename, target);
        return fs.ensureDir(path.dirname(target)).then(() => fs.writeFile(target, contents));
      })
    );

    return this;
  }

  /**
   * Get file contents as a UTF-8 string
   * @param {string} relativePath Relative path
   * @return {string}
   */
  fileContents(relativePath: string): string {
    return this.file(relativePath).contents.toString();
  }

  /**
   * Write contents to specific file
   * @param {string} relativePath Relative path
   * @param {string} string File content as a UTF-8 string
   */
  writeContents(relativePath: string, string: string): Majo {
    this.files[relativePath].contents = Buffer.from(string);
    return this;
  }

  /**
   * Get the fs.Stats object of specified file
   * @param {string} relativePath Relative path
   * @return {fs.Stats}
   */
  fileStats(relativePath: string): fs.Stats {
    return this.file(relativePath).stats;
  }

  /**
   * Get a file by relativePath path
   * @param {string} relativePath Relative path
   * @return {MajoFile}
   */
  file(relativePath: string): MajoFile {
    return this.files[relativePath];
  }

  /**
   * Delete a file
   * @param {string} relativePath Relative path
   */
  deleteFile(relativePath: string): Majo {
    delete this.files[relativePath];
    return this;
  }

  /**
   * Create a new file
   * @param {string} relativePath Relative path
   * @param {MajoFile} file
   */
  createFile(relativePath: string, file: MajoFile): Majo {
    this.files[relativePath] = file;
    return this;
  }

  /**
   * Get an array of sorted file paths
   * @return {string[]}
   */
  get fileList(): string[] {
    return Object.keys(this.files).sort();
  }

  rename(fromPath: string, toPath: string): Majo {
    const file = this.files[fromPath];
    this.createFile(toPath, {
      path: path.resolve(this.baseDir, toPath),
      stats: file.stats,
      contents: file.contents
    });
    this.deleteFile(fromPath);
    return this;
  }
}

const majo = (): Majo => new Majo();

majo.glob = glob;
majo.fs = fs;

export default majo;
