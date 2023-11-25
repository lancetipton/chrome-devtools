// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// IMPORTANT: this file is auto generated. Please do not edit this file.
/* istanbul ignore file */
const styles = new CSSStyleSheet();
styles.replaceSync(
`/*
 * Copyright 2021 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

.message {
  line-height: 20px;
  font-size: 14px;
  color: var(--override-markdown-view-message-color, --sys-color-token-subtle);
  margin-bottom: 4px;
  user-select: text;
}

.message p {
  margin-bottom: 16px;
  margin-block-start: 2px;
}

.message ul {
  list-style-type: none;
  list-style-position: inside;
  padding-inline-start: 0;
}

.message li {
  margin-top: 8px;
  display: list-item;
}

.message li::before {
  content: "→";
  -webkit-mask-image: none;
  padding-right: 5px;
  position: relative;
  top: -1px;
}

.message code {
  color: var(--sys-color-on-surface);
  font-size: 12px;
  user-select: text;
  cursor: text;
  background: var(--sys-color-surface1);
}

.codeblock {
  margin-bottom: 8px;
  box-sizing: border-box;
  border-radius: 4px;
  background-color: var(--sys-color-surface5);
  color: var(--sys-color-on-surface);
}

.codeblock .toolbar {
  box-sizing: border-box;
  display: flex;
  height: 28px;
  flex-direction: row;
  padding: 0 11px;
  font-size: 11px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
}

.codeblock code {
  box-sizing: border-box;
  width: 100%;
  padding: 10px;
  display: block;
  overflow: auto;
  white-space: pre;
}

.codeblock .lang {
  padding: 6px 0;
  flex: 1;
}

.codeblock .copy {
  padding: 4px 0;
}

.devtools-link {
  color: var(--sys-color-primary);
  outline-offset: 2px;
  text-decoration: none;
}

.devtools-link:hover {
  text-decoration: underline;
}

/*# sourceURL=markdownView.css */
`);

export default styles;
