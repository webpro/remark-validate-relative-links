# remark-validate-relative-links

Validate relative links, including headings.

## Example

### Input

```markdown
These [example](#example) [links](./README.md) are [all][1] fine.

[Missing](#notfound) [links](./link) give warnings.

[External](https://github.com/webpro/remark-validate-relative-links) and [absolute][2] links are ignored.
```

### Output

```sh
README.md
11:1-11:21  warning Cannot find heading `#notfound` in this file missing-heading remark-validate-relative-links
11:22-11:37 warning Cannot find file `./link`                    missing-file    remark-validate-relative-links

⚠ 2 warnings
```

[1]: ./README.md#example

[2]: /webpro/remark-validate-relative-links
