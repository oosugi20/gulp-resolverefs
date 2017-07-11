# gulp-resolverefs
Resolve splited YAML to JSON (OPS)

# Usage

```javascript
var resolveRefs = require('gulp-resolverefs');

gulp.task('resolve-refs-json', function () {
  return gulp.src('./test/yaml/index.yaml')
    .pipe('index.json')
    .pipe(gulp.dest('./dist/'));
});
```

