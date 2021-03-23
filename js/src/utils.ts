import {
  IRequestResult, request,
} from "requests-helper";

export const canUrlBeIframed = async (url: string): Promise<boolean> => {
  const res: IRequestResult = await request("get", url);
  const headers = res.headers.toLowerCase();
  return (headers.indexOf("x-frame-options: deny") >= 0) || (headers.indexOf("x-frame-options: sameorigin") >= 0);
};
