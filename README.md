# OW Coach Public Release v14

Public GitHub Pages build based on v13, with SEO title and beta scope wording updated.

## Deploy target

Static GitHub Pages site. Upload these files to the repository root or the configured Pages publishing folder.

## Included files

- `index.html`: app body, embedded data, Google Analytics tag, Microsoft Clarity tag
- `robots.txt`: crawler policy
- `sitemap.xml`: sitemap for `https://owcoach.jp/`
- `validation_report.json`: source-level validation report

## Public wording

- Search title is generalized to `OW Coach | Overwatch 2 構成診断・対策ガイド`.
- The page clearly states this is a beta version.
- The page clearly states that the current supported diagnosis targets are only `ソルジャー76` and `ソジョーン`.

## Notes

- If you publish to a GitHub Pages URL instead of `https://owcoach.jp/`, update the canonical URL, Open Graph URL, robots sitemap URL, and sitemap loc.
- If you use a custom domain, configure it in GitHub Pages settings. Add a `CNAME` file only after the domain is ready.
