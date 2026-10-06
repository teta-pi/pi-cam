// Minimal real-filesystem-backed stand-in for expo-file-system's File/
// Directory API, sufficient for modules/c2pa's usage (bytes/text/write/
// list/exists/create). Backed by a real temp directory so file content
// round-trips genuinely, instead of jest-expo's silent native-call mocks.
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

function toFsPath(uri: string): string {
  return uri.startsWith('file://') ? uri.slice('file://'.length) : uri;
}

function toUri(p: string): string {
  return p.startsWith('file://') ? p : `file://${p}`;
}

type PathLike = string | { uri: string };

function joinParts(uris: PathLike[]): string {
  const parts = uris.map((u) => toFsPath(typeof u === 'string' ? u : u.uri).replace(/\/$/, ''));
  return path.join(...parts);
}

export class File {
  uri: string;
  constructor(...uris: PathLike[]) {
    this.uri = toUri(joinParts(uris));
  }
  get exists(): boolean {
    return fs.existsSync(toFsPath(this.uri));
  }
  write(content: string | Uint8Array): void {
    fs.mkdirSync(path.dirname(toFsPath(this.uri)), { recursive: true });
    fs.writeFileSync(toFsPath(this.uri), content as never);
  }
  async text(): Promise<string> {
    return fs.readFileSync(toFsPath(this.uri), 'utf8');
  }
  async base64(): Promise<string> {
    return fs.readFileSync(toFsPath(this.uri)).toString('base64');
  }
  async bytes(): Promise<Uint8Array> {
    return new Uint8Array(fs.readFileSync(toFsPath(this.uri)));
  }
}

export class Directory {
  uri: string;
  constructor(...uris: PathLike[]) {
    this.uri = toUri(joinParts(uris));
  }
  get exists(): boolean {
    const p = toFsPath(this.uri);
    return fs.existsSync(p) && fs.statSync(p).isDirectory();
  }
  create(options: { intermediates?: boolean } = {}): void {
    fs.mkdirSync(toFsPath(this.uri), { recursive: !!options.intermediates });
  }
  list(): Array<File | Directory> {
    const base = toFsPath(this.uri);
    return fs.readdirSync(base).map((name) => {
      const full = path.join(base, name);
      return fs.statSync(full).isDirectory() ? new Directory(toUri(full) + '/') : new File(toUri(full));
    });
  }
}

export const Paths = {
  document: toUri(fs.mkdtempSync(path.join(os.tmpdir(), 'picam-fs-'))),
};
