import React from "react";
import { Composition } from "remotion";
import { Thumbnail, ThumbProps } from "./Thumbnail";
import { BannerPro, Logo } from "./Brand";
import thumbs from "./thumbnails.json";
import brand from "./brand.json";

/* LOCKED brand assets (brand.json): official logo = Logo 2, official banner = Banner 3. */
export const BrandingRoot: React.FC = () => (
  <>
    <Composition id="Logo" component={Logo} durationInFrames={1} fps={30} width={800} height={800} defaultProps={{ variant: brand.logo.chosen as 2 }} />
    <Composition id="Banner" component={BannerPro} durationInFrames={1} fps={30} width={2560} height={1440} defaultProps={{ variant: brand.banner.chosen as 3 }} />
    <Composition id="BannerGuide" component={BannerPro} durationInFrames={1} fps={30} width={2560} height={1440} defaultProps={{ variant: brand.banner.chosen as 3, guide: true }} />
    {Object.entries(thumbs as Record<string, ThumbProps>).map(([id, p]) => (
      <Composition key={id} id={`Thumb-${id}`} component={Thumbnail as unknown as React.FC<Record<string, unknown>>} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={p as unknown as Record<string, unknown>} />
    ))}
  </>
);
