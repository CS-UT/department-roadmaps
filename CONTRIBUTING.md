# مشارکت در پروژه نقشه راه

از علاقه شما به مشارکت در این پروژه ممنونیم! هدف ما اینه که نقشه راه تمام رشته‌های دانشگاه تهران رو پوشش بدیم.

## افزودن نقشه راه رشته جدید

افزودن رشته جدید **نیاز به تغییر کد نداره** — فقط کافیه یک فایل YAML بسازید.

### مراحل

#### ۱. fork کردن ریپو

ابتدا [مخزن پروژه](https://github.com/CS-UT/department-roadmaps) را fork کنید و روی سیستم خود clone کنید:

```bash
git clone https://github.com/<your-username>/department-roadmaps.git
cd department-roadmaps
npm install
```

#### ۲. ساخت فایل yaml

یک فایل yaml در مسیر `src/data/roadmaps/` بسازید. نام فایل باید مختصر و انگلیسی باشد (مثلاً `physics.yaml`).

```yaml
id: physics              # شناسه یکتا (انگلیسی)
name: فیزیک              # نام کامل رشته (فارسی)
label: فیزیک             # عنوان کوتاه برای تب
pdf: /Physics-UT-V1.pdf  # اختیاری — لینک PDF در پوشه public/

courses:
  - id: ph-calc1
    name: ریاضی عمومی ۱
    credits: 4
    category: base

  - id: ph-phys1
    name: فیزیک ۱
    credits: 3
    category: base

  - id: ph-phys2
    name: فیزیک ۲
    credits: 3
    category: specialized
    prerequisites: [ph-phys1]

  - id: ph-lab1
    name: آزمایشگاه فیزیک ۱
    credits: 1
    category: special
    corequisites: [ph-phys1]
```

#### ۳. فرمت فایل YAML

**فیلدهای اصلی:**

| فیلد    | الزامی | توضیح                              |
| ------- | ------ | ---------------------------------- |
| `id`    | بله    | شناسه یکتای رشته (انگلیسی)        |
| `name`  | بله    | نام کامل رشته (فارسی)             |
| `label` | بله    | نام کوتاه برای نمایش در تب        |
| `pdf`   | خیر   | مسیر فایل PDF در پوشه `public/`   |

**فیلدهای هر درس:**

| فیلد            | الزامی | توضیح                                                 |
| --------------- | ------ | ----------------------------------------------------- |
| `id`            | بله    | شناسه یکتای درس (با پیشوند رشته، مثلاً `ph-calc1`)   |
| `name`          | بله    | نام درس به فارسی                                      |
| `credits`       | بله    | تعداد واحد                                             |
| `category`      | بله    | یکی از: `base`، `specialized`، `elective`، `special` |
| `prerequisites` | خیر   | لیست شناسه پیش‌نیازها                                  |
| `corequisites`  | خیر   | لیست شناسه هم‌نیازها                                   |

**دسته‌بندی دروس:**

- `base` (پایه) — دروس پایه و عمومی
- `specialized` (تخصصی) — دروس تخصصی اصلی
- `elective` (اختیاری) — دروس اختیاری
- `special` (خاص) — دروس خاص مانند پروژه، کارآموزی و سمینار

#### ۴. تست

```bash
npm run dev
```

با اینکار روی سیستم خودتان مطمئن شوید که رودمپ به درستی نمایش داده می‌شود.

#### ۵. ارسال Pull Request

تغییرات را Commit و Push کنید و یک Pull Request به بسازید.

### نکات مهم

- شناسه دروس (`id`) باید **در کل پروژه یکتا** باشد. از پیشوند رشته استفاده کنید (مثلاً `ph-` برای فیزیک).
- `prerequisites` و `corequisites` فقط به شناسه دروس **همان فایل** اشاره می‌کنند.
- اگر PDF نقشه راه دارید، آن را در پوشه `public/` قرار دهید.

## گزارش مشکل یا پیشنهاد

- برای گزارش مشکل، یک [Issue](https://github.com/CS-UT/department-roadmaps/issues) بسازید.
- برای هر نوع مشارکت دیگر، Pull Request ارسال کنید.
