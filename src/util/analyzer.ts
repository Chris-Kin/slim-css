import { WebContainer } from '@webcontainer/api';

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance: WebContainer;

export const files = {
    'index.css': {
      file: {
        contents: `
            .a {
                color: red;
            }`,
      },
    },
    'index.js': {
        file: {
          contents: `
              import postcss from 'postcss';
              const a = postcss.parse('.a{color: red}');
              console.log(a);
              `,
        },
      },
    'package.json': {
      file: {
        contents: `
            {
                "name": "example-app",
                "type": "module",
                "dependencies": {
                    "express": "latest",
                    "nodemon": "latest",
                    "postcss": "latest",
                    "postcss-cli": "latest"
                },
                "scripts": {
                    "start": "node './' index.js"
                }
            }`,
      },
    },
};

window.addEventListener('load', async () => {
  // Call only once
  webcontainerInstance = await WebContainer.boot();
  await webcontainerInstance.mount(files);

  const packageJSON = await webcontainerInstance.fs.readFile('package.json', 'utf-8');
//   console.log('reading file finished:', packageJSON);


  const installProcess = await webcontainerInstance.spawn('npm', ['install']);
  // Wait for install command to exit
//   installProcess.output.pipeTo(new WritableStream({
//     write(data) {
//       console.log(data);
//     }
//   }));
});

export async function runPostCss() {
    const postcssProcess = await webcontainerInstance.spawn('npm', ['run', 'start']);
    // Wait for postcss command to exit
    postcssProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log('【postcssProcess】', data);
      }
    }));
};

export async function writeCSSFile(content: string) {
    await webcontainerInstance.fs.writeFile('/index.css', content);
    // const packageJSON = await webcontainerInstance.fs.readFile('index.css', 'utf-8');
    // console.log('new css file is:', packageJSON);
    runPostCss();
};