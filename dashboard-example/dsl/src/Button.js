/** @jsx jsx */
import { jsx, css } from "@emotion/core";

const Button = ({ children }) => (
  <button
    css={css`
      background: blue;
      color: #fff;
      padding: 12px;
    `}
  >
    {children}
  </button>
);

export default Button;
