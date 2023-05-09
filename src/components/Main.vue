<template>
  <div style="position: relative">
    <div class="inputer">
      <input
        type="url"
        ref="cssurl"
        placeholder="https://unpkg.com/element-plus/dist/index.css"
        required
        value="https://unpkg.com/element-plus/dist/index.css"
      />
      <button @click="onFetchCSS">
        <img v-show="isFetchingCSSFile" src="/loading.svg" alt="">
        <span v-show="!isFetchingCSSFile">GO</span>
      </button>
    </div>
    <div id="monaco" ref="monaco"></div>
    <div class="btn" @click="onAnalyze">
      <img v-show="isAnalyzing" src="/loading.svg" alt="">
      <span v-show="!isAnalyzing">analyze</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as Monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';

// @ts-ignore
import Tooltip from './tooltip/index.js';

import { writeCSSFile } from '../util/analyzer';

self.MonacoEnvironment = {
    getWorker(_, label) {
      if (['css', 'scss', 'less'].includes(label)) {
        return new cssWorker();
      }
      if (['typescript', 'javascript'].includes(label)) {
        return new tsWorker();
      }
      if (['json'].includes(label)) {
        return new jsonWorker();
      }
      if (['html'].includes(label)) {
        return new htmlWorker();
      }
      return new editorWorker();
    },
};

defineProps<{ msg: string }>()

const cssurl = ref();
const monaco = ref();
const isFetchingCSSFile = ref(false);
const isAnalyzing = ref(false);

const value = `.foo {
  color: red;
  width: 200px;
}
.bar {
  padding: 20px;
  font-size: 18px;
  padding: 20px;
}
.foo, .bar {
  font-size: 18px;
}
`;

let editor: Monaco.editor.IStandaloneCodeEditor;

onMounted(() => {
  editor = Monaco.editor.create(monaco.value, {
    value,
    language: 'css',
    folding: true,
    theme: 'vs-dark',
    scrollbar: {
      verticalScrollbarSize: 4,
      horizontalScrollbarSize: 4,
    },
    // inDiffEditor: true,
    fontSize: 17,
    minimap: {
      enabled: true,
    },
    formatOnPaste: true,
    renderValidationDecorations: 'on',
  });

  window.addEventListener('resize', () => {
    editor.layout();
  });
})

async function onFetchCSS(): Promise<void> {
  if (isFetchingCSSFile.value) {
    return;
  }
  isFetchingCSSFile.value = true;
  const url = cssurl.value.value;
  try {
    new URL(url);
  } catch (e: any) {
    Tooltip('Invalid URL');
    isFetchingCSSFile.value = false;
    return;
  }
  try {
    let res = await (await fetch(url)).text();
    editor.setValue(res as unknown as string);
    editor.getAction('editor.action.formatDocument')?.run();
  } catch (e: any) {
    Tooltip('Network Error');
  } finally {
    setTimeout(() => {
      isFetchingCSSFile.value = false;
    }, 300);
  }
}

function onAnalyze(): void {
  const css = editor.getValue();
  if (!css) {
    Tooltip('Empty CSS');
    return;
  }

  if (isAnalyzing.value) {
    return;
  }
  isAnalyzing.value = true;

  writeCSSFile(css, (data: any[]) => {
    isAnalyzing.value = false;
    console.warn('repeated rules is:', data[0]);
    console.warn('total rules:', data[1]);
    const rate = (data[2]/data[1]*100).toFixed(1);
    console.warn('repetition rate:', rate);
    Tooltip(`repetition rate is ${rate}%, you can open devtools to see more info.`);
  });
}

</script>

<style lang="less" scoped>
#monaco {
  height: 700px;
  text-align: left;
}
.btn {
  color: var(--color-main);
  font-size: 30px;
  font-weight: 600;
  z-index: 1;
  position: absolute;
  background: #444;
  width: 100%;
  line-height: 32px;
  height: 40px;
  opacity: 0.7;
  border-radius: 0 0 10px 10px;
  cursor: pointer;
  user-select: none;
  &:hover {
    opacity: 1;
  }
  img {
    height: 20px;
    animation: rolling 1s cubic-bezier(0.26, 0.54, 0.69, 0.42) infinite;
  }
}
.inputer {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  input {
    border: none;
    height: 39px;
    box-sizing: border-box;
    border-radius: 8px 0 0 8px;
    padding: 0 8px;
    border-right-width: 0;
    outline: none;
    width: 400px;
  }
  button {
    border-radius: 0 8px 8px 0;
    outline: none;
    width: 66px;
    img {
      height: 15px;
      animation: rolling 1s cubic-bezier(0.26, 0.54, 0.69, 0.42) infinite;
    }
  }
}

@keyframes rolling {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
