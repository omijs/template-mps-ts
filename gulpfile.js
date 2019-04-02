var gulp = require('gulp')
var path = require('path')
var tap = require('gulp-tap')
var fs = require('fs')
var jsx2wxml = require('./_scripts/jsx2wxml')
var watch = require('gulp-watch');
var prettier = require('prettier')
var colors = require('colors');

function buildComponent(code) {
  return `
class WeElement {
  render () {
    return ${code.trim()}
  }
}`}

var baseOptions = {
  isRoot: false,
  isApp: false,
  sourcePath: __dirname,
  outputPath: __dirname,
  code: '',
  isTyped: false
}

gulp.task('watch', () => {
  watch(['./**/*.jsx', '!./node_modules/**', '!./_scripts/**'], { events: ['add', 'change'] }, (evt, type) => {
    var contents = fs.readFileSync(evt.path)
    compile({
      path: evt.path,
      contents: contents.toString()
    }, true)
  })
})

//加 cache？同样的字符串返回同样的结果
gulp.task('compile', () => {
  return gulp
    .src(['./**/*.jsx', '!./node_modules/**', '!./_scripts/**'])
    .pipe(
      tap(file => {
        compile({
          path: file.path,
          contents: file.contents.toString()
        })
      })
    )

})

function compile(file, watch) {

  var dir = path.dirname(file.path)
  var arr = dir.split(/\\|\//)
  var name = arr[arr.length - 1]
  console.log('[编译文件]'.green ,  file.path)
  var template = jsx2wxml.default({
    ...baseOptions,
    code: buildComponent(file.contents)
  }).template.replace(/<block>/,'').replace(/([\s\S]*)<\/block>/,'$1')
  console.log('[编译完成]'.green ,  file.path)

  const res = prettier.format(template, { parser: "html" })
  console.log('[代码美化]'.green , name + '.wxml' )

  fs.writeFileSync(dir + '/' + name + '.wxml', res)
  console.log('[写入文件]' .green , name + '.wxml')

  if(watch){
    console.log('[编译完成]'.green , name + '.wxml' )
    console.log('[监听更改]'.green, '...' )
  }
}

gulp.task('default', ['compile', 'watch'])
console.log('[开始编译]'.green ,'...')
gulp.start('default',function(){
  console.log('[编译完成]'.green , '恭喜你全部文件编译完成。' )
  console.log('[监听更改]'.green, '...' )
})
