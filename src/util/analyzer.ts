import { WebContainer } from '@webcontainer/api';

// @ts-ignore
import Tooltip from '../components/tooltip/index.js';

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance: WebContainer;

export const files = {
    'index.css': {
      file: {
        contents: '',
      },
    },
    'index.js': {
        file: {
          contents: `
              import postcss from 'postcss';
              const { env: { css } } = process;
              // const ast = postcss.parse(process.env.css);
              const ast = postcss.parse(css);
              ast.nodes.forEach(it => {
                if (it.type !== 'rule') {
                  return;
                }
                it.nodes.forEach(decl => {
                  if (decl.type !== 'decl') {
                    return;
                  }
                  console.log({
                    selectors: it.selectors,
                    prop: decl.prop,
                    value: decl.value
                  });
                });
              });
              `,
        },
      },
    'package.json': {
      file: {
        contents: `
            {
                "name": "slim-css",
                "type": "module",
                "dependencies": {
                    "postcss": "latest"
                },
                "scripts": {
                    "start": "node './' index.js"
                }
            }`,
      },
    },
};

window.addEventListener('load', async () => {
  Tooltip('Booting WebContainer');

  // Call only once
  webcontainerInstance = await WebContainer.boot();
  await webcontainerInstance.mount(files);

  await webcontainerInstance.spawn('npm', ['install']);

  setTimeout(() => {
    Tooltip('WebContainer is Ready!');
  }, 300);

  webcontainerInstance.on('error', (e: any) => {
    Tooltip('WebContainer Error:' + e.message);
  });
});

export async function runPostCSS(css: string) {
    // const postcssProcess = await webcontainerInstance.spawn('npm', ['run', 'start']);
    const postcssProcess = await webcontainerInstance.spawn('node', ['index.js'], {
      env: {
        css: css.replace(/\n/g, ''),
        NO_COLOR: true,
      }
    });
    
    const rules: any = {};
    const repeatRules: any = {};
    let allRulesCount = 0;
    let repeatedRulesCount = 0;
    postcssProcess.output.pipeTo(new WritableStream({
      write(dataStr) {
        const obj = eval(`(${dataStr})`);
        console.log('【postcssProcess】', obj);
        allRulesCount += 1;
        const key = `${obj.selectors.join()}-${obj.prop}-${obj.value}`;
        if ( key in rules ) {
          repeatRules[key] = true;
          repeatedRulesCount++;
        } else {
          rules[key] = true;
        }
        console.log(rules, repeatRules, allRulesCount, repeatedRulesCount);
      },
      close() {
        console.log('😂👌👌 i should be the last');
      },
      abort(err) {
        console.log("WritableStream abort error:", err);
      }
    }), { preventClose: false }).then(e => console.log('eee🫘🫘🫘🫘🫘', e));
};

export async function writeCSSFile(content: string) {
    await webcontainerInstance.fs.writeFile('/index.css', content);
    const css = await webcontainerInstance.fs.readFile('index.css', 'utf-8');
    runPostCSS(css);
};
