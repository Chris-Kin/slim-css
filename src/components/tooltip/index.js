import { defineComponent, h, render } from "vue";
import Tooltip from "./index.vue";

const TooltipCons = defineComponent(Tooltip);

let container = null;

const createComp = function (options, children) {
  const vnode = h(TooltipCons, { ...options }, children);
  container = document.createElement("div");
  render(vnode, container);
  document.body.appendChild(vnode.el);
};

export default function (children, options = {}) {
  const close = options.onClose;
  // 重新封装close，添加移除元素操作
  options.onClose = () => {
    close && close();
    render(null, container);
  };

  createComp(options, children);
}
