# AsciiDoc Artifact Generator

The generator uses the templates already present in `docs/templates/domain/*.adoc` and
`docs/templates/architecture/adr.adoc`.It does not replace or edit them.

Usage:

```bash
npm run generate -- domain capability "Customer Management"
```

```bash
npm run generate -- domain bounded-context "Customer Context"
```

```bash
npm run generate -- domain entity "Customer" --context "Customer Context"
```

```bash
npm run generate -- architecture adr "Use PostgreSQL"
```

```bash
npm run generate -- architecture adr "Use PostgreSQL" --dry-run
```

```bash
npm run test:generator
```

Domain output: `docs/modules/domain/pages/catalog/<type>/<slug>.adoc`

ADR output: `docs/modules/architecture/pages/decisions/<4-digit-number>-<slug>.adoc`

## Supported template placeholders

| Placeholder | Description                                          |
|-------------|------------------------------------------------------|
| {{name}}    | Artifact Name                                        |
| {{title}}   | Document Titel                                       |
| {{date}}    | Creation Date                                        |
| {{context}} | Bounded Context (Optional)                           |
| {{slug}}    | File name without extension                          |
| {{number}}  | Sequential ADR number (Optional)                     |
| {{id}}      | Alias for {{number}}                                 |
| {{type}}    | entity,value-object,bounded-context, capability, adr |
| {{status}}  | Initialstatus Proposed                               |

Unknown placeholders are retained. Existing files are never overwritten. The generator does not modify Antora
navigation.

Note: If your current AsciiDoc templates use different placeholders, adapt the replacement mapping in `generate.mjs` or
update those placeholders in the templates. If the ADR template uses no placeholders, its content is copied unchanged,
so adapt its title line to `= {{number}} - {{title}}`.
