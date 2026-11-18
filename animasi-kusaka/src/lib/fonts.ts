import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

let fontsLoaded = false;
export function useFonts() {
  const [handle] = useState(() => (fontsLoaded ? null : delayRender("fonts")));
  useEffect(() => {
    if (!handle) return;
    Promise.all([
      new FontFace("Bangers", `url(${staticFile("fonts/Bangers.woff2")})`).load(),
      new FontFace("Baloo2", `url(${staticFile("fonts/Baloo2-800.woff2")})`).load(),
      new FontFace("Oswald", `url(${staticFile("fonts/Oswald-600.woff2")})`, { weight: "600" }).load(),
      new FontFace("Poppins", `url(${staticFile("fonts/Poppins-700.woff2")})`, { weight: "700" }).load(),
    ]).then((fonts) => { fonts.forEach((f) => document.fonts.add(f)); fontsLoaded = true; continueRender(handle); });
  }, [handle]);
}
