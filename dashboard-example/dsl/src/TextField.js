/** @jsx jsx */
import { jsx, css } from "@emotion/core";

const style = css`
  background: #eee;
  color: #fff;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const TextField = ({ value, onChange }) => (
  <input css={style} value={value} onChange={onChange} />
);

export default TextField;
