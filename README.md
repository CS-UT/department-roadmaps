# Department Roadmaps

Interactive mindmap-style visualization of university department course roadmaps. Built with React and [xyflow](https://github.com/xyflow/xyflow).

Currently includes roadmaps for the University of Tehran's Faculty of Mathematics, Statistics, and Computer Science:

- **CS** (علوم کامپیوتر)
- **Statistics** (آمار)
- **Mathematics** (ریاضیات و کاربردها)

## Adding a New Department

Adding a new department requires **no code changes** — just drop a single YAML file into `src/data/roadmaps/`.

### 1. Create the YAML file

Create a file like `src/data/roadmaps/my-dept.yaml`:

```yaml
id: my-dept
name: نام گروه
label: نام تب          # shown in the tab bar
pdf: /My-Dept-V1.pdf   # optional link to PDF in public/

courses:
  - id: md-course1
    name: درس اول
    credits: 3
    category: base

  - id: md-course2
    name: درس دوم
    credits: 3
    category: specialized
    prerequisites: [md-course1]

  - id: md-lab
    name: آزمایشگاه
    credits: 1
    category: special
    corequisites: [md-course1]
```

### 2. That's it

The app auto-discovers all `.yaml` files in `src/data/roadmaps/` at build time. Your new department will appear as a tab automatically.

### YAML Format Reference

**Top-level fields:**

| Field   | Required | Description                          |
| ------- | -------- | ------------------------------------ |
| `id`    | yes      | Unique department identifier         |
| `name`  | yes      | Full department name (displayed in mindmap) |
| `label` | yes      | Short label for the tab bar          |
| `pdf`   | no       | Path to PDF file in `public/`        |

**Course fields:**

| Field            | Required | Description                                         |
| ---------------- | -------- | --------------------------------------------------- |
| `id`             | yes      | Unique course ID (prefix with department, e.g. `cs-calc1`) |
| `name`           | yes      | Course name in Persian                               |
| `credits`        | yes      | Number of credits                                    |
| `category`       | yes      | One of: `base`, `specialized`, `elective`, `special` |
| `prerequisites`  | no       | List of course IDs that must be passed before        |
| `corequisites`   | no       | List of course IDs that must be taken together       |

### Tips

- Use a consistent prefix for course IDs within a department (e.g. `cs-`, `st-`, `ma-`).
- The `prerequisites` and `corequisites` arrays reference other course IDs **within the same file**.
- If you have a PDF version of the roadmap, place it in the `public/` directory and set the `pdf` field.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## License

[MIT](LICENSE)
