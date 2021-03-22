import axios, {AxiosResponse} from "axios";

export const canUrlBeIframed = async (url: string): Promise<boolean> => await axios.get(url).then((res: AxiosResponse) => {
  if ("x-frame-options" in res.headers) {
    const xFrameOptions = res.headers["x-frame-options"].toLowerCase();
    return !(xFrameOptions === "sameorigin" || xFrameOptions === "deny");
  }
  return true;
});

