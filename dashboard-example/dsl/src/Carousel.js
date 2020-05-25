/** @jsx jsx */
import { jsx, css } from "@emotion/core";

const style = css`
  background: #777;
  color: #fff;
  padding: 12px;
`;

const Carousel = ({ children }) => (
  <div css={style}>
    <div>Carousel!</div>
    <div>{children}</div>
  </div>
);

export default Carousel;
