// eslint-disable-next-line @typescript-eslint/no-var-requires
const imagedataToSVG = require("imagetracerjs").imagedataToSVG;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pixels = require("image-pixels");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const scale = require("scale-that-svg");

class FaviconNotFoundError extends Error{
  public constructor(message: string){
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

const getSiteDom = async (url: string): Promise<Document> => fetch(url).then(async (res) => {
  const parser = new DOMParser();
  return parser.parseFromString(await res.text(), "text/xml");
});

const getFavicon = async (site: string): Promise<string> => {
  let faviconUrl: string;
  const dom = await getSiteDom(site);
  const nodeList = dom.getElementsByTagName("link");
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < nodeList.length; i++) {
    if ((nodeList[i].getAttribute("rel") === "icon") || (nodeList[i].getAttribute("rel") === "shortcut icon")) {
      faviconUrl = nodeList[i].getAttribute("href");
      break;
    }
  }
  if (typeof faviconUrl == "undefined"){
    throw new FaviconNotFoundError(site);
  }
  const data = await pixels(site + faviconUrl);
  const unscaledSvg = imagedataToSVG(data);
  return await scale(unscaledSvg, { scale: 52 / data.width });
};

export default getFavicon;
