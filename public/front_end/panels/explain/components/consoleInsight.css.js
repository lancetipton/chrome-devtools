// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// IMPORTANT: this file is auto generated. Please do not edit this file.
/* istanbul ignore file */
const styles = new CSSStyleSheet();
styles.replaceSync(
`/*
 * Copyright 2023 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

:host {
  --max-height: 2000px;
  --loading-max-height: 140px;

  font-family: var(--default-font-family);
  font-size: inherit;
  display: block;
  overflow: hidden;
  max-height: 0;
}

:host-context(.opening) {
  animation: expand-to-loading var(--sys-motion-duration-medium2) var(--sys-motion-easing-emphasized);
  animation-fill-mode: forwards;
}

:host-context(.loaded) {
  animation: expand-to-full var(--sys-motion-duration-medium2) var(--sys-motion-easing-emphasized);
  animation-fill-mode: forwards;
}

:host-context(.closing) {
  animation: collapse var(--sys-motion-duration-medium2) var(--sys-motion-easing-emphasized);
  animation-fill-mode: forwards;
}

@keyframes expand-to-loading {
  from {
    max-height: 0;
  }

  to {
    max-height: var(--loading-max-height);
  }
}

@keyframes expand-to-full {
  from {
    max-height: var(--actual-height, var(--loading-max-height));
  }

  to {
    max-height: var(--max-height);
  }
}

@keyframes collapse {
  from {
    max-height: var(--actual-height, var(--max-height));
  }

  to {
    max-height: 0;
    margin-top: 0;
    margin-bottom: 0;
  }
}

.wrapper {
  padding: 16px 20px;
  background-color: var(--sys-color-cdt-base-container);
  border-radius: 16px;
}

.wrapper.top {
  border-radius: 16px 16px 4px 4px;
}

.wrapper.bottom {
  margin-top: 5px;
  border-radius: 4px 4px 16px 16px;
}

header {
  display: flex;
  flex-direction: row;
  gap: 6px;
  color: var(--sys-color-on-surface);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  height: 20px;
}

header > .filler {
  flex: 1;
}

main {
  --override-markdown-view-message-color: var(--sys-color-on-surface);

  margin: 20px 0 0;
  color: var(--sys-color-on-surface);
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
}

devtools-markdown-view {
  margin-bottom: 12px;
}

footer {
  display: flex;
  flex-direction: row;
  color: var(--sys-color-on-surface);
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-top: 8px;
}

footer > div:nth-child(1) {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

footer > .filler {
  flex: 1;
}

textarea {
  height: 84px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--sys-color-neutral-outline);
  width: 100%;
  font-family: var(--default-font-family);
  font-size: inherit;
}

.buttons {
  margin-bottom: 16px;
}

.dogfood-feedback {
  display: flex;
  gap: 2px;
  align-items: center;
}

.link {
  color: var(--sys-color-primary);
  text-decoration-line: underline;
}

.loader {
  background:
    linear-gradient(
      130deg,
      transparent 0%,
      var(--sys-color-gradient-tertiary) 20%,
      var(--sys-color-gradient-primary) 40%,
      transparent 60%,
      var(--sys-color-gradient-tertiary) 80%,
      var(--sys-color-gradient-primary) 100%
    );
  background-position: 0% 0%;
  background-size: 250% 250%;
  animation: gradient 5s infinite linear;
}

@keyframes gradient {
  0% { background-position: 0 0; }
  100% { background-position: 100% 100%; }
}

summary {
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
}

details {
  --collapsed-height: 20px;

  overflow: hidden;
  height: var(--collapsed-height);
}

details[open] {
  height: calc(var(--list-height) + var(--collapsed-height) + /* margin */ 8px);
  transition: height var(--sys-motion-duration-short4) var(--sys-motion-easing-emphasized);
}

.refine-container {
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  margin-bottom: 12px;
  gap: 8px;
}

h2 {
  display: block;
  font-size: inherit;
  margin: 0;
  font-weight: inherit;
}

/*# sourceURL=./components/consoleInsight.css */
`);

export default styles;
