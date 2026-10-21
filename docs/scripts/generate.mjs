import {readFile, mkdir, writeFile, readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const types = new Set(['aggregate', 'bounded-context', 'business-rule', 'capability', 'domain-event', 'domain-service', 'entity', 'subdomain', 'value-object']);
const usage = `Usage:\n  npm run generate -- domain <type> "Name"\n  npm run generate -- architecture adr "Decision title"\n  Options: --context "Context name" --dry-run`;

function slug(value) {
    return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/([a-z])([A-Z][a-z])/g, '$1-$2').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function titleCase(s) {
    return s.split('-').map(p => p[0]?.toUpperCase() + p.slice(1)).join(' ');
}

function parse(args) {
    const [area, type, name, ...rest] = args;
    if (!area || !type || !name || name.startsWith('--')) throw new Error(usage);
    const opts = {context: '', dryRun: false};
    for (let i = 0; i < rest.length; i++) {
        if (rest[i] === '--dry-run') opts.dryRun = true;
        else if (rest[i] === '--context' && rest[i + 1] && !rest[i + 1].startsWith('--')) opts.context = rest[++i];
        else throw new Error(`Unknown or incomplete option: ${rest[i]}\n${usage}`);
    }
    if (!((area === 'domain' && types.has(type)) || (area === 'architecture' && type === 'adr'))) throw new Error(`Unsupported artifact: ${area}/${type}\n${usage}`);
    if (!slug(name)) throw new Error('Name must contain at least one letter or digit in ASCII after normalization.');
    return {area, type, name, ...opts};
}

async function generate(args, root = docsRoot) {
    const {area, type, name, context, dryRun} = parse(args);
    const templatePath = path.join(root, 'templates', area, `${type}.adoc`);
    const template = await readFile(templatePath, 'utf8');
    const dir = area === 'domain'
        ? path.join(root, 'modules', 'domain', 'pages', 'catalog', type)
        : path.join(root, 'modules', 'architecture', 'pages', 'decisions');
    let filename = `${slug(name)}.adoc`;
    let number = '';
    if (type === 'adr') {
        let entries = [];
        try {
            entries = await readdir(dir);
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
        }
        const numbers = entries.map(f => /^([0-9]{4})-.*\.adoc$/i.exec(f)?.[1]).filter(Boolean).map(Number);
        number = String(Math.max(0, ...numbers) + 1).padStart(4, '0');
        filename = `${number}-${slug(name)}.adoc`;
    }
    const dest = path.join(dir, filename);
    const today = new Date().toISOString().slice(0, 10);
    const vars = {
        name,
        title: name,
        date: today,
        context,
        slug: slug(name),
        number,
        id: number,
        status: 'Proposed',
        type: titleCase(type)
    };
    let content = template.replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g, (match, key) => Object.hasOwn(vars, key) ? String(vars[key]) : match);
    if (dryRun) {
        console.log(`[dry-run] ${dest}`);
        return dest;
    }
    await mkdir(dir, {recursive: true});
    await writeFile(dest, content, {flag: 'wx'});
    console.log(`Created ${path.relative(root, dest)}`);
    return dest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    generate(process.argv.slice(2)).catch(e => {
        console.error(e.code === 'EEXIST' ? `File already exists; refusing to overwrite. ${e.path}` : e.message);
        process.exitCode = 1;
    });
}
export {generate, slug, parse};
