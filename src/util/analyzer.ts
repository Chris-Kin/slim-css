import { debounce } from 'lodash-es';
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

export async function runPostCSS(css: string, cb: Function) {
    const streamEndCB = debounce((...arr) => {
      cb(arr);
    }, 2400, {
      leading: false,
    });

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
        try {
          const obj = eval(`(${dataStr})`);
          // console.log('【postcssProcess】', obj);

          obj.selectors.forEach((selector: string) => {
            allRulesCount += 1;
            const key = `${selector}-${obj.prop}-${obj.value}`;
            if ( key in rules ) {
              repeatRules[key] = true;
              repeatedRulesCount++;
            } else {
              rules[key] = true;
            }
            // simulating ending event which pass all data
            streamEndCB(repeatRules, allRulesCount, repeatedRulesCount);
          });
        } catch {
          console.error('something error');
        }
      },
      close() {
        console.log('【WritableStream close】...');
      },
      abort(err) {
        console.log("【WritableStream abort】", err);
      }
    }), { preventClose: false }).catch((e) => console.log('【WritableStream error】', e));
};

export async function writeCSSFile(content: string, cb: Function) {
    await webcontainerInstance.fs.writeFile('/index.css', content);
    const css = await webcontainerInstance.fs.readFile('index.css', 'utf-8');
    runPostCSS(css, cb);
};
