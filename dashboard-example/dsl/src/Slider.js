/** @jsx jsx */
import { jsx, css } from "@emotion/core";

const style = css`
  background: green;
  color: #fff;
  padding: 12px;
`;

const Slider = ({ children }) => (
  <div css={style}>
    <div>Slider!</div>
    {children}
  </div>
);

export default Slider;
