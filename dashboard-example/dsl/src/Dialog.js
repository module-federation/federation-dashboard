/** @jsx jsx */
import { jsx, css } from "@emotion/core";

const style = css`
  background: #aaa;
  color: #333;
  padding: 12px;
`;

const Dialog = ({ children }) => (
  <div css={style}>
    <div>Design System Language Dialog</div>
    <div>{children}</div>
  </div>
);

export default Dialog;
