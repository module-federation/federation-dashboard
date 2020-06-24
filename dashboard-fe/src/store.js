import { atom } from "recoil";

export const selectedApplicationAtom = atom({
  key: "selectedApplication",
  default: null,
});

export const detailDrawerOpenAtom = atom({
  key: "detailDrawerOpen",
  default: false,
});
